// Cache only slow-changing dashboard reads. Invitations, authorization checks,
// reports, and live analysis/polling responses always go to the server.
// Company analysis history keeps a refresh snapshot, but revalidates every request.
const MAX_ENTRIES = 100;
const MAX_BODY_LENGTH = 250_000;
interface Entry { body: string; expiresAt: number; }

export function dashboardCacheTtl(path: string): number {
  if (/^\/companies\/\d+\/analysis$/.test(path)) return 300_000;
  if (path === '/github/app/info') return 30_000;
  if (/^\/companies\/my-(admin|member)$/.test(path)) return 30_000;
  if (/^\/companies\/\d+\/repositories$/.test(path)) return 60_000;
  if (/^\/companies\/\d+\/available-repositories$/.test(path)) return 30_000;
  if (/^\/github\/orgs\/[^/]+\/repos$/.test(path)) return 120_000;
  if (/^\/github\/repos\/[^/]+\/[^/]+\/contributors$/.test(path)) return 300_000;
  return 0;
}

export function createDashboardCache(
  baseUrl: string,
  userId: string,
  isCurrentUser: () => boolean = () => true,
) {
  const prefix = `debtlens:api:v1:${encodeURIComponent(baseUrl)}:${encodeURIComponent(userId)}:`;
  const memory = new Map<string, Entry>();
  const pending = new Map<string, Promise<Response>>();
  let generation = 0;

  function pathFor(url: string): string | null {
    const base = new URL(baseUrl, window.location.origin);
    const target = new URL(url, window.location.origin);
    if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname + '/')) return null;
    return target.pathname.slice(base.pathname.length);
  }

  function readEntry(url: string): Entry | null {
    if (!userId || !isCurrentUser() || !dashboardCacheTtl(pathFor(url) ?? '')) return null;
    try {
      const entry = memory.get(url) ?? JSON.parse(sessionStorage.getItem(prefix + url) ?? 'null');
      if (!entry || typeof entry.body !== 'string' || !Number.isFinite(entry.expiresAt)
          || entry.expiresAt <= Date.now() || entry.body.length > MAX_BODY_LENGTH) {
        memory.delete(url);
        sessionStorage.removeItem(prefix + url);
        return null;
      }
      JSON.parse(entry.body);
      memory.set(url, entry);
      return entry;
    } catch {
      memory.delete(url);
      return null;
    }
  }

  function response(entry: Entry): Response {
    return new Response(entry.body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  function clear() {
    generation++;
    memory.clear();
    pending.clear();
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith(prefix)) sessionStorage.removeItem(key);
      }
    } catch { /* Storage can be unavailable; the network still works. */ }
  }

  function write(url: string, entry: Entry) {
    memory.set(url, entry);
    if (memory.size > MAX_ENTRIES) memory.delete(memory.keys().next().value!);
    try {
      const keys = Object.keys(sessionStorage).filter(key => key.startsWith(prefix));
      if (keys.length >= MAX_ENTRIES && !keys.includes(prefix + url)) sessionStorage.removeItem(keys[0]);
      sessionStorage.setItem(prefix + url, JSON.stringify(entry));
    } catch { /* Never fail a successful request because storage is full. */ }
  }

  return {
    clear,
    read<T>(url: string): T | null {
      const entry = readEntry(url);
      return entry ? JSON.parse(entry.body) as T : null;
    },
    async fetch(url: string, init?: RequestInit): Promise<Response> {
      if (!isCurrentUser()) throw new DOMException('Account changed', 'AbortError');
      const path = pathFor(url);
      const method = (init?.method ?? 'GET').toUpperCase();
      const ttl = method === 'GET' && path ? dashboardCacheTtl(path) : 0;
      const authorized = path === '/github/app/info' || new Headers(init?.headers).has('Authorization');
      if (!userId || !ttl || !authorized || init?.signal || init?.cache === 'no-store') {
        const res = await fetch(url, init);
        if (!isCurrentUser()) throw new DOMException('Account changed', 'AbortError');
        if (path && res.ok && !['GET', 'HEAD', 'OPTIONS'].includes(method)) clear();
        if (res.status === 401 || res.status === 403) clear();
        return res;
      }
      const saved = readEntry(url);
      const revalidate = /^\/companies\/\d+\/analysis$/.test(path ?? '');
      if (saved && !revalidate) return response(saved);
      const existing = pending.get(url);
      if (existing) return (await existing).clone();
      const startedGeneration = generation;
      const request = (async () => {
        const res = await fetch(url, init);
        if (!isCurrentUser()) throw new DOMException('Account changed', 'AbortError');
        if (res.status === 401 || res.status === 403) clear();
        if (res.ok && res.status === 200 && startedGeneration === generation) {
          const body = await res.clone().text();
          try {
            JSON.parse(body);
            if (body.length <= MAX_BODY_LENGTH && startedGeneration === generation && isCurrentUser()) {
              write(url, { body, expiresAt: Date.now() + ttl });
            }
          } catch { /* Invalid JSON must not become a cached result. */ }
        }
        return res;
      })();
      pending.set(url, request);
      try { return (await request).clone(); }
      finally { if (pending.get(url) === request) pending.delete(url); }
    },
  };
}

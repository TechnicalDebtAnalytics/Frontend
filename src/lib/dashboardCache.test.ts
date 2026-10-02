import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDashboardCache } from './dashboardCache';

const base = '/api';
const repos = '/api/github/orgs/acme/repos?installationId=1';
const headers = { Authorization: 'Bearer secret-token' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' },
});

describe('dashboard cache', () => {
  beforeEach(() => { sessionStorage.clear(); });

  it('survives a refresh without storing bearer tokens', async () => {
    const fetch = vi.fn().mockResolvedValue(json([{ id: 1 }]));
    vi.stubGlobal('fetch', fetch);
    await createDashboardCache(base, 'user-a').fetch(repos, { headers });
    const afterRefresh = createDashboardCache(base, 'user-a');
    expect(await (await afterRefresh.fetch(repos, { headers })).json()).toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(sessionStorage)).not.toContain('secret-token');
  });

  it('separates users and installations', async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(json([])));
    vi.stubGlobal('fetch', fetch);
    const first = createDashboardCache(base, 'user-a');
    await first.fetch(repos, { headers });
    await createDashboardCache(base, 'user-b').fetch(repos, { headers });
    await first.fetch(repos.replace('=1', '=2'), { headers });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('refetches after TTL expiry', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(json([])));
    vi.stubGlobal('fetch', fetch);
    const cache = createDashboardCache(base, 'user-a');
    await cache.fetch(repos, { headers });
    vi.advanceTimersByTime(120_001);
    await cache.fetch(repos, { headers });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent GETs while allowing each caller to read its response', async () => {
    let resolve!: (response: Response) => void;
    const fetch = vi.fn().mockReturnValue(new Promise<Response>(done => { resolve = done; }));
    vi.stubGlobal('fetch', fetch);
    const cache = createDashboardCache(base, 'user-a');
    const a = cache.fetch(repos, { headers });
    const b = cache.fetch(repos, { headers });
    resolve(json([{ id: 1 }]));
    const [ra, rb] = await Promise.all([a, b]);
    expect(await ra.json()).toEqual(await rb.json());
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('invalidates cached lists after a successful mutation', async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(json([])));
    vi.stubGlobal('fetch', fetch);
    const cache = createDashboardCache(base, 'user-a');
    await cache.fetch(repos, { headers });
    await cache.fetch('/api/companies/1/github-installation', { method: 'POST', headers });
    await cache.fetch(repos, { headers });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('does not cache errors, invitation responses or live analysis status', async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(json([])));
    vi.stubGlobal('fetch', fetch);
    const cache = createDashboardCache(base, 'user-a');
    for (const url of ['/api/invitations/my-pending', '/api/repositories/1/analysis', '/api/analysis/1/report']) {
      await cache.fetch(url, { headers });
      await cache.fetch(url, { headers });
    }
    fetch.mockResolvedValue(json({ message: 'rate limited' }, 403));
    await cache.fetch(repos, { headers });
    await cache.fetch(repos, { headers });
    expect(fetch).toHaveBeenCalledTimes(8);
  });

  it('does not write an old request into the cache after invalidation', async () => {
    let resolve!: (response: Response) => void;
    const fetch = vi.fn().mockReturnValue(new Promise<Response>(done => { resolve = done; }));
    vi.stubGlobal('fetch', fetch);
    const cache = createDashboardCache(base, 'user-a');
    const request = cache.fetch(repos, { headers });
    cache.clear();
    resolve(json([{ id: 1 }]));
    await request;
    expect(cache.read(repos)).toBeNull();
  });

  it('discards an in-flight response when the signed-in account changes', async () => {
    let current = true;
    let resolve!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>(done => { resolve = done; })));
    const cache = createDashboardCache(base, 'user-a', () => current);
    const request = cache.fetch(repos, { headers });
    current = false;
    resolve(json([{ id: 1 }]));
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(sessionStorage.length).toBe(0);
  });

  it('does not reuse cached private data when the request has no authorization', async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(json([])));
    vi.stubGlobal('fetch', fetch);
    const cache = createDashboardCache(base, 'user-a');
    await cache.fetch(repos, { headers });
    await cache.fetch(repos);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('persists analysis history for immediate reads but revalidates every fetch', async () => {
    const url = '/api/companies/1/analysis';
    const completed = [{ analysisId: 1, status: 'COMPLETED' }];
    const running = [{ analysisId: 2, status: 'RUNNING' }, ...completed];
    const fetch = vi.fn().mockResolvedValueOnce(json(completed)).mockResolvedValueOnce(json(running));
    vi.stubGlobal('fetch', fetch);
    await createDashboardCache(base, 'user-a').fetch(url, { headers });
    const refreshed = createDashboardCache(base, 'user-a');
    expect(refreshed.read(url)).toEqual(completed);
    expect(await (await refreshed.fetch(url, { headers })).json()).toEqual(running);
    expect(refreshed.read(url)).toEqual(running);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(createDashboardCache(base, 'user-b').read(url)).toBeNull();
  });

  it('expires history snapshots and clears them when a new analysis starts', async () => {
    vi.useFakeTimers();
    const url = '/api/companies/1/analysis';
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(json([]))));
    const cache = createDashboardCache(base, 'user-a');
    await cache.fetch(url, { headers });
    vi.advanceTimersByTime(300_001);
    expect(cache.read(url)).toBeNull();
    await cache.fetch(url, { headers });
    await cache.fetch('/api/repositories/1/analysis', { method: 'POST', headers });
    expect(cache.read(url)).toBeNull();
  });

});

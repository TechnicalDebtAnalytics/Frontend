import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'


describe('CFG-06 frontend configuration contract', () => {
  it('defines required Auth0 variables and a configurable API base URL', () => {
    const frontendRoot = process.cwd()
    const env = readFileSync(join(frontendRoot, '.env'), 'utf8')
    const keys = new Set(
      env
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => line.split('=', 1)[0]),
    )

    for (const required of [
      'VITE_AUTH0_DOMAIN',
      'VITE_AUTH0_CLIENT_ID',
      'VITE_AUTH0_AUDIENCE',
    ]) {
      expect(keys.has(required), `missing ${required}`).toBe(true)
    }

    const sourceDirectory = join(frontendRoot, 'src')
    const applicationSource = readdirSync(sourceDirectory, { recursive: true })
      .filter((path) => typeof path === 'string' && path.endsWith('.tsx') && !path.endsWith('.test.tsx'))
      .map((path) => readFileSync(join(sourceDirectory, path), 'utf8'))
      .join('\n')

    expect.soft(keys.has('VITE_API_BASE_URL'), 'missing VITE_API_BASE_URL').toBe(true)
    expect.soft(
      applicationSource.includes('http://localhost:8080'),
      'frontend source contains a hardcoded local API URL',
    ).toBe(false)
    expect.soft(
      applicationSource.includes('import.meta.env.VITE_API_BASE_URL'),
      'frontend source does not consume VITE_API_BASE_URL',
    ).toBe(true)
  })
})

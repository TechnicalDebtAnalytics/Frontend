import { useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { API_BASE_URL } from './api'

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function useAdminApi() {
  const { getAccessTokenSilently } = useAuth0()

  return useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const token = await getAccessTokenSilently()
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      let message = `Request failed (${response.status})`
      try {
        const body = await response.json() as { message?: string }
        if (body.message) message = body.message
      } catch {
        // Keep the status-based message for non-JSON failures.
      }
      throw new ApiError(message, response.status)
    }
    return response.json() as Promise<T>
  }, [getAccessTokenSilently])
}

export function queryString(values: Record<string, string | number | boolean | null | undefined>) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  return params.toString()
}

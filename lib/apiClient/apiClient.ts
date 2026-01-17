import { getPath } from '@/lib/path';
import { ApiError } from './ApiError'

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: any
}

class ApiClient {
  private token?: string

  setToken(token?: string) {
    this.token = token
  }

  clearToken() {
    this.token = undefined
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const res = await fetch(
      getPath(`/api/${endpoint}`),
      {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token
            ? { Authorization: `Bearer ${this.token}` }
            : {}),
          ...options.headers,
        },
        body: options.body
          ? JSON.stringify(options.body)
          : undefined,
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new ApiError(data.message || 'API Error', res.status)
    }

    return data as T
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

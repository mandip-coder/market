'use client'
import { useToken } from "@/hooks/useToken";
import { toast } from "react-toastify";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, any> | null;
};
const baseURL = process.env.NEXT_PUBLIC_BASE_PATH

export const useApi = () => {
  const token = useToken();

  async function APICore<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, ...customOptions } = options;
    const config: RequestInit = {
      method,
      ...customOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }
    const res = await fetch(`${baseURL}/api/` + endpoint, config);
    const data = await res.json();
    if (!res.ok) {
      const errorMessage = data.message || data.error || `Error ${res.status}: ${res.statusText}`;
      toast.error(errorMessage)
      return null as T

    }
    return data as T;
  }


  return {
    get: <T = any>(endpoint: string, opts: Omit<FetchOptions, 'body' | 'method'> = {}) =>
      APICore<T>(endpoint, { ...opts, method: 'GET' }),
    post: <T = any>(endpoint: string, body?: Record<string, any> | null, opts: Omit<FetchOptions, 'body' | 'method'> = {}) =>
      APICore<T>(endpoint, { ...opts, method: 'POST', body }),
    put: <T = any>(endpoint: string, body?: Record<string, any> | null, opts: Omit<FetchOptions, 'body' | 'method'> = {}) =>
      APICore<T>(endpoint, { ...opts, method: 'PUT', body }),
    patch: <T = any>(endpoint: string, body?: Record<string, any> | null, opts: Omit<FetchOptions, 'body' | 'method'> = {}) =>
      APICore<T>(endpoint, { ...opts, method: 'PATCH', body }),
    delete: <T = any>(endpoint: string, opts: Omit<FetchOptions, 'body' | 'method'> = {}) =>
      APICore<T>(endpoint, { ...opts, method: 'DELETE' }),
  };
};


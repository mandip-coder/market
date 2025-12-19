import 'server-only'
import { serverAPI } from "./serverAPIConfig";

export async function SERVERAPI<T = any>(url: string, options: RequestInit = {}) {
  return await serverAPI<T>(url, options)
}

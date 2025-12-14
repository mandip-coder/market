import { serverAPI } from "./serverAPIConfig";


export async function SERVERAPI(url: string, options: RequestInit = {}) {
  let res = null
  const server = await serverAPI()
  res = await server(url, options);
  return res
}

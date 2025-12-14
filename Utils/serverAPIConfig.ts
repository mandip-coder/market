import { auth } from "@/lib/authOptions";
import { cookies } from "next/headers";
const SERVER_URL = process.env.BACKEND_URL;

export async function serverAPI() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("next-auth.session-token")?.value;
  const secureSessionToken = cookieStore.get("__Secure-next-auth.session-token")?.value;
  const authUser = await auth()
  const serverToken = authUser
  const accessToken = serverToken?.accessToken;

  return async function <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${SERVER_URL}/${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      throw new Error("Session token not found or expired");
    }
    if (secureSessionToken && process.env.NODE_ENV === 'production') {
      headers.Cookie = `__Secure-next-auth.session-token=${secureSessionToken}`;
    }
    else if (sessionToken) {
      headers.Cookie = `next-auth.session-token=${sessionToken}`;
    }

    try {
      const res = await fetch(url, {
        headers,
        credentials: "include",
        cache: "no-store",
        ...options,
      });


      if (!res.ok) {
        const data = await res.json();
        data.status = res.status
        return data as Promise<T>;
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json() as Promise<T>;
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Expected JSON but got: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      throw error;
    }
  };
}

"use server"

import { SERVERAPI } from "@/Utils/apiFunctions";
import { signOut } from "../authOptions"
import { APIPATH } from "@/shared/constants/url";
import { getPath } from "@/lib/path";

export async function logoutAction() {
  const res = await SERVERAPI(APIPATH.LOGOUT, { method: "POST" })
  await signOut({ redirectTo: getPath("/auth/login") });
  return { success: true };
  if (res.statusCode === 401) {
    await signOut({ redirectTo: getPath("/auth/login") });
    return { success: false };
  }
  else {
    return { success: false, error: res.message };
  }
}

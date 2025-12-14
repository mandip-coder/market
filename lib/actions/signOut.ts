"use server"

import { SERVERAPI } from "@/Utils/apiFunctions";
import { signOut } from "../authOptions"
import { APIPATH } from "@/shared/constants/url";

export async function logoutAction() {
  const res = await SERVERAPI(APIPATH.LOGOUT, { method: "POST" })
  if (res.status) {
    await signOut({ redirectTo: "/auth/login" });
    return { success: true };
  }
  else {
    return { success: false, error: res.message };
  }
}

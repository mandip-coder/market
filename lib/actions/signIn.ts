"use server"

import { AuthError } from "next-auth"
import { signIn } from "../authOptions"

export type SignInState = {
  error: string | null
  errorType: string | null
  success: boolean
}
const signInValues = {
  email: "",
  password: "",
}
export async function signInAction(formData: typeof signInValues): Promise<SignInState> {
  try {
    await signIn("credentials", {...formData, redirect: false})
    return {
      error: null,
      errorType: null,
      success: true,
    }
  } catch (err) {
    if (err instanceof AuthError) {
      let msg=""
      switch (err.type) {
        case "CredentialsSignin":
          msg = "Invalid credentials";
          break;
        case "CallbackRouteError":
          msg = "Invalid credentials";
          break;
        default:
          msg = err.message
          break;
      }
      return {
        error: msg,
        errorType: err.type,
        success: false,
      }
    }
    throw err
  }
}
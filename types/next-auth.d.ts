import { DefaultSession } from "next-auth"
import { Company, Role, PageAccess } from "@/types/authorization"

declare module "next-auth" {
  interface Session {
    user: {
      userUUID: string
      fullName?: string | null
      email?: string | null
      image?: string | null
      companies?: Company[]
    } & DefaultSession["user"]
    accessToken?: string
    accessTokenExpires?: number
    error?: string
  }

  interface User {
    userUUID: string
    fullName?: string | null
    email?: string | null
    image?: string | null
    token: string
    accessTokenExpires?: number
    companies?: Company[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    accessTokenExpires?: number
    error?: string
    refreshCount?: number
    user?: {
      userUUID: string
      fullName?: string | null
      email?: string | null
      image?: string | null
      companies?: Company[]
      token: string
      accessTokenExpires?: number
    }
  }
}

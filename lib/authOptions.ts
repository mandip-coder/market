import NextAuth, { User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { jwtDecode } from "jwt-decode"
import { APIPATH } from "@/shared/constants/url"

// Define interfaces with proper naming
interface Company {
  companyUUID: string
  displayName: string
  roles: string[]
}

// Extend the built-in session and user types
declare module "next-auth" {
  interface Session {
    user: User & {
      userId: string
      fullName?: string | null
      email?: string | null
      image?: string | null
      companies?: Company[]
    }
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

// Extend the built-in JWT type
declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    accessTokenExpires?: number
    error?: string
    refreshCount?: number
  }
}

// Authentication function
async function authorizeUser(credentials: Record<string, unknown> | undefined) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Missing credentials");
  }

  const res = await fetch(`${process.env.BACKEND_URL}/${APIPATH.LOGIN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usernameOrEmail: credentials.email,
      password: credentials.password,
    }),
  });
  const resData = await res.json();
  if(!resData.status){
    throw new Error(resData.message);
  }
  const data = resData.data as User | undefined;
  if (!data || !data.token) {
    console.error("Auth response missing data/token:", resData);
    throw new Error("Invalid authentication response");
  }

  const { email, companies = [], userUUID, fullName, token } = data;

  // Decode token safely
  let decodedToken: { exp?: number } | null = null;

  try {
    decodedToken = jwtDecode(token);
  } catch (e) {
    throw new Error("Invalid token format");
  }

  return {
    userUUID: userUUID ?? "",
    fullName: fullName ?? "",
    email,
    token,
    companies,
    accessTokenExpires: decodedToken?.exp ? decodedToken.exp * 1000 : undefined
  };

}

// Token refresh function


// NextAuth configuration
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
   basePath: "/api/authentication",
  session: {
    strategy: 'jwt',
    updateAge: 0,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign-in: put full user into the token
      if (user && account) {
        token.id = user.userUUID
        token.accessToken = user.token
        token.accessTokenExpires = user.accessTokenExpires
        token.refreshCount = 0

        // we already extended JWT with `user: User` in your declare module
        token.user = {
          userUUID: user.userUUID,
          fullName: user.fullName ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          companies: user.companies ?? [],
          token: user.token,
          accessTokenExpires: user.accessTokenExpires,
        }

        return token
      }

      // Return previous token if still valid
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      return token
    },

    async session({ session, token }) {
      // Make sure we have both token.user and session.user before assigning
      if (token.user && session.user) {
        const userFromToken = token.user as User

        // Copy all relevant fields so session.user always has full user
        session.user.userUUID = userFromToken.userUUID
        session.user.fullName = userFromToken.fullName
        session.user.email = userFromToken.email || ""
        session.user.image = userFromToken.image
        session.user.companies = userFromToken.companies
      }

      // Extra things you already had on session
      session.accessToken = token.accessToken
      session.accessTokenExpires = token.accessTokenExpires
      session.error = token.error

      return session
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: authorizeUser
    }),
  ],
}); 
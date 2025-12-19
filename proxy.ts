// middleware.ts
import { NextResponse } from "next/server"
import { auth } from "./lib/authOptions";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH

const pagePath={
  login:"/auth/login",
  dashboard:"/dashboard"
}
export default auth((req) => {
  const res=NextResponse.next();
  const isAuthenticated = !!req.auth
  const pathName = req.nextUrl.pathname
  const isAuthPage = pathName === basePath+pagePath.login

  if (!isAuthenticated && !isAuthPage) {
    const response = NextResponse.redirect(new URL(basePath+pagePath.login, req.url));
    return response;
  }
 
  return res
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
}
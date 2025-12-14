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
  // A user is considered authenticated if they have a session
  // AND there is no session error (like "AccessTokenExpired").
  const isAuthenticated = !!req.auth
  const pathName = req.nextUrl.pathname
  const isAuthPage = pathName === basePath+pagePath.login

  // If the user is not authenticated (or their token is expired)
  // and they are trying to access a protected page, redirect them to the login page.
  if (!isAuthenticated && !isAuthPage) {
    // Let's also destroy the session cookie on the client side to clean up
    const response = NextResponse.redirect(new URL(basePath+pagePath.login, req.url));
    // You can optionally clear the cookie by setting its expiration to the past
    // response.cookies.set('next-auth.session-token', '', { expires: new Date(0) });
    // response.cookies.set('__Secure-next-auth.session-token', '', { expires: new Date(0) }); // for https
    return response;
  }

  // If the user is successfully authenticated and they are on the login page,
  // redirect them to the dashboard.
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL(basePath+pagePath.dashboard, req.url))
  }
  
  
  // For all other cases, proceed as normal.
  return res
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
}
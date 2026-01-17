// proxy.ts - Enhanced middleware with authorization
import { NextResponse } from "next/server";
import { auth } from "./lib/authOptions";
import { getPath } from "./lib/path";
import {
  getCurrentCompany,
  getCurrentPageAccess,
  canAccessRoute,
  isSuperAdmin,
  getCurrentRoles
} from "./lib/authorization";

const pagePath = {
  login: "/auth/login",
  dashboard: "/dashboard",
  forgetPassword: "/auth/forget-password",
  resetPassword: "/auth/reset-password",
  otpVerification: "/auth/otp-verification",
  unauthorized: "/unauthorized",
};

const authPages = [
  getPath(pagePath.login),
  getPath(pagePath.forgetPassword),
  getPath(pagePath.resetPassword),
  getPath(pagePath.otpVerification),
];

// Public routes that don't require authentication or authorization
const publicRoutes = [
  getPath(pagePath.unauthorized),
];

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const pathName = req.nextUrl.pathname;

  const isAuthPage = authPages.includes(pathName);
  const isPublicRoute = publicRoutes.includes(pathName);

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(
      new URL(getPath(pagePath.dashboard), req.url)
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isAuthPage && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(getPath(pagePath.login), req.url)
    );
  }

  // Authorization checks for authenticated users
  if (isAuthenticated && !isAuthPage && !isPublicRoute) {
    const user = req.auth?.user;

    if (!user || !user.companies || user.companies.length === 0) {
      // User has no companies, redirect to unauthorized
      return NextResponse.redirect(
        new URL(getPath(pagePath.unauthorized), req.url)
      );
    }

    // Get current company and its permissions
    const currentCompany = getCurrentCompany(user.companies);
    const roles = getCurrentRoles(currentCompany);
    const pageAccess = getCurrentPageAccess(currentCompany);

    // // Super admins have access to everything
    // if (isSuperAdmin(roles)) {
    //   return NextResponse.next();
    // }

    // Check if user has access to the current route
    // if (!canAccessRoute(pageAccess, pathName)) {
    //   // User doesn't have access to this route
    //   return NextResponse.redirect(
    //     new URL(getPath(pagePath.unauthorized), req.url)
    //   );
    // }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};

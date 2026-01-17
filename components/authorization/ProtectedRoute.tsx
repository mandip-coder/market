// Protected route component for page-level authorization

"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthorization } from "@/hooks/useAuthorization";
import { PageAccess, RoleCode } from "@/types/authorization";
import { Result, Button } from "antd";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPageAccess?: PageAccess | PageAccess[];
  requiredRole?: RoleCode | RoleCode[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Component to protect routes based on page access or roles
 * Usage:
 * <ProtectedRoute requiredPageAccess="DASHBOARD">
 *   <DashboardContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredPageAccess,
  requiredRole,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { hasPageAccess, hasRole } = useAuthorization();

  // Check page access
  if (requiredPageAccess && !hasPageAccess(requiredPageAccess)) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have access to this page."
          extra={
            <Button type="primary" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  // Check role
  if (requiredRole && !hasRole(requiredRole)) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have the required role to access this page."
          extra={
            <Button type="primary" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}

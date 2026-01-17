// Role gate component for conditional rendering based on roles

"use client";

import { ReactNode } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { RoleCode } from "@/types/authorization";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: RoleCode | RoleCode[];
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on user roles
 * Usage:
 * <RoleGate allowedRoles={["ROLE_ADMIN", "ROLE_SUPER_ADMIN"]}>
 *   <AdminPanel />
 * </RoleGate>
 */
export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { hasRole } = useAuthorization();

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component to render content only for super admins
 */
export function SuperAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isSuperAdmin } = useAuthorization();

  if (!isSuperAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component to render content only for admins (super admin or admin)
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin } = useAuthorization();

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

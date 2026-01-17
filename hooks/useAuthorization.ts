// Authorization hooks for React components

"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Company,
  Role,
  RoleCode,
  PageAccess,
  Permission,
  AuthorizationContext,
} from "@/types/authorization";
import {
  hasRole,
  hasPageAccess,
  hasPermission,
  isSuperAdmin,
  isAdmin,
  getCurrentCompany,
  getCurrentRoles,
  getCurrentPageAccess,
  canAccessRoute,
} from "@/lib/authorization";

/**
 * Main authorization hook
 * Provides all authorization-related functionality
 */
export function useAuthorization(): AuthorizationContext {
  const { data: session, update } = useSession();

  const currentCompany = useMemo(() => {
    if (!session?.user?.companies) return null;
    return getCurrentCompany(session.user.companies);
  }, [session?.user?.companies]);

  const roles = useMemo(() => {
    return getCurrentRoles(currentCompany);
  }, [currentCompany]);

  const pageAccess = useMemo(() => {
    return getCurrentPageAccess(currentCompany);
  }, [currentCompany]);

  const authContext: AuthorizationContext = useMemo(
    () => ({
      currentCompany,
      roles,
      pageAccess,
      hasRole: (roleCode: RoleCode | RoleCode[]) => hasRole(roles, roleCode),
      hasPageAccess: (page: PageAccess | PageAccess[]) => hasPageAccess(pageAccess, page),
      hasPermission: (feature: string, permission: Permission) =>
        hasPermission(roles, feature, permission),
      isSuperAdmin: () => isSuperAdmin(roles),
      isAdmin: () => isAdmin(roles),
      switchCompany: async (companyUUID: string) => {
        if (!session?.user?.companies) return;

        const newCompany = session.user.companies.find(
          (c) => c.companyUUID === companyUUID
        );

        if (!newCompany) {
          throw new Error("Company not found");
        }

        // Update session with new default company
        const updatedCompanies = session.user.companies.map((c) => ({
          ...c,
          isDefault: c.companyUUID === companyUUID,
        }));

        await update({
          user: {
            ...session.user,
            companies: updatedCompanies,
          },
        });
      },
    }),
    [currentCompany, roles, pageAccess, session, update]
  );

  return authContext;
}

/**
 * Hook to check if user has specific role(s)
 */
export function useHasRole(roleCode: RoleCode | RoleCode[]): boolean {
  const { hasRole } = useAuthorization();
  return hasRole(roleCode);
}

/**
 * Hook to check if user has page access
 */
export function useHasPageAccess(page: PageAccess | PageAccess[]): boolean {
  const { hasPageAccess } = useAuthorization();
  return hasPageAccess(page);
}

/**
 * Hook to check if user has permission for a feature
 */
export function useHasPermission(feature: string, permission: Permission): boolean {
  const { hasPermission } = useAuthorization();
  return hasPermission(feature, permission);
}

/**
 * Hook to check if user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const { isSuperAdmin } = useAuthorization();
  return isSuperAdmin();
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuthorization();
  return isAdmin();
}

/**
 * Hook to get current company
 */
export function useCurrentCompany(): Company | null {
  const { currentCompany } = useAuthorization();
  return currentCompany;
}

/**
 * Hook to get current roles
 */
export function useCurrentRoles(): Role[] {
  const { roles } = useAuthorization();
  return roles;
}

/**
 * Hook to check if user can access a route
 */
export function useCanAccessRoute(pathname: string): boolean {
  const { pageAccess } = useAuthorization();
  return canAccessRoute(pageAccess, pathname);
}

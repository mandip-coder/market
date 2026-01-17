// Authorization utility functions

import { Company, Role, RoleCode, PageAccess, Permission } from "@/types/authorization";
import { FEATURE_PERMISSIONS, PAGE_ROUTES } from "./constants";
import { getPath } from "../path";

/**
 * Check if user has a specific role
 */
export function hasRole(roles: Role[], requiredRole: RoleCode | RoleCode[]): boolean {
  if (!roles || roles.length === 0) return false;

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.some((role) => requiredRoles.includes(role.roleCode));
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: Role[], requiredRoles: RoleCode[]): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => requiredRoles.includes(role.roleCode));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(roles: Role[], requiredRoles: RoleCode[]): boolean {
  if (!roles || roles.length === 0) return false;
  return requiredRoles.every((requiredRole) =>
    roles.some((role) => role.roleCode === requiredRole)
  );
}

/**
 * Check if user has page access
 */
export function hasPageAccess(
  pageAccess: PageAccess[],
  requiredPage: PageAccess | PageAccess[]
): boolean {
  if (!pageAccess || pageAccess.length === 0) return false;

  const requiredPages = Array.isArray(requiredPage) ? requiredPage : [requiredPage];
  return requiredPages.some((page) => pageAccess.includes(page));
}

/**
 * Check if user can access a specific route based on page access
 */
export function canAccessRoute(pageAccess: PageAccess[], pathname: string): boolean {
  if (!pageAccess || pageAccess.length === 0) return false;

  // Check if pathname matches any page route
  for (const [page, routes] of Object.entries(PAGE_ROUTES)) {
    if (pageAccess.includes(page as PageAccess)) {
      console.log(routes)
      if (routes.some((route) => pathname.startsWith(getPath(route)))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(roles: Role[]): boolean {
  return hasRole(roles, "ROLE_SUPER_ADMIN");
}

/**
 * Check if user is admin (super admin or admin)
 */
export function isAdmin(roles: Role[]): boolean {
  return hasAnyRole(roles, ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"]);
}

/**
 * Get the highest role based on hierarchy

/**
 * Check if user has permission for a specific feature
 */
export function hasPermission(
  roles: Role[],
  feature: string,
  permission: Permission
): boolean {
  if (!roles || roles.length === 0) return false;

  // Super admin has all permissions
  if (isSuperAdmin(roles)) return true;

  // Check each role's permissions
  for (const role of roles) {
    const rolePermissions = FEATURE_PERMISSIONS[role.roleCode];
    if (!rolePermissions) continue;

    // Check wildcard permissions
    if (rolePermissions["*"]?.includes(permission)) return true;

    // Check feature-specific permissions
    if (rolePermissions[feature]?.includes(permission)) return true;
  }

  return false;
}

/**
 * Get all permissions for a feature


/**
 * Get current company from user's companies
 */
export function getCurrentCompany(companies: Company[]): Company | null {
  if (!companies || companies.length === 0) return null;

  // First try to find the default company
  const defaultCompany = companies.find((c) => c.isDefault);
  if (defaultCompany) return defaultCompany;

  // Then try to find the primary company
  const primaryCompany = companies.find((c) => c.isPrimary);
  if (primaryCompany) return primaryCompany;

  // Otherwise return the first company
  return companies[0];
}

/**
 * Get roles from current company
 */
export function getCurrentRoles(company: Company | null): Role[] {
  if (!company || !company.roles) return [];
  return company.roles;
}

/**
 * Get page access from current company
 */
export function getCurrentPageAccess(company: Company | null): PageAccess[] {
  if (!company || !company.pageAccess) return [];
  return company.pageAccess;
}


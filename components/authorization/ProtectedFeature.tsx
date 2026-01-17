// Protected feature component for feature-level authorization

"use client";

import { ReactNode } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Permission, RoleCode } from "@/types/authorization";
import { Tooltip } from "antd";

interface ProtectedFeatureProps {
  children: ReactNode;
  feature?: string;
  permission?: Permission;
  requiredRole?: RoleCode | RoleCode[];
  fallback?: ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

/**
 * Component to protect features based on permissions or roles
 * Usage:
 * <ProtectedFeature feature="product" permission="create">
 *   <Button>Create Product</Button>
 * </ProtectedFeature>
 */
export function ProtectedFeature({
  children,
  feature,
  permission,
  requiredRole,
  fallback = null,
  showTooltip = false,
  tooltipMessage = "You don't have permission to access this feature",
}: ProtectedFeatureProps) {
  const { hasPermission, hasRole } = useAuthorization();

  // Check permission
  if (feature && permission && !hasPermission(feature, permission)) {
    if (showTooltip) {
      return (
        <Tooltip title={tooltipMessage}>
          <span style={{ cursor: "not-allowed", opacity: 0.5 }}>
            {children}
          </span>
        </Tooltip>
      );
    }
    return <>{fallback}</>;
  }

  // Check role
  if (requiredRole && !hasRole(requiredRole)) {
    if (showTooltip) {
      return (
        <Tooltip title={tooltipMessage}>
          <span style={{ cursor: "not-allowed", opacity: 0.5 }}>
            {children}
          </span>
        </Tooltip>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

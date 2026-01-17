// Authorization types based on your API response structure

export type RoleCode = 
  | "ROLE_SUPER_ADMIN" 
  | "ROLE_ADMIN" 
  | "ROLE_USER" 
  | "ROLE_MANAGER"
  | string; // Allow for custom roles

export type PageAccess = 
  | "COMPANY"
  | "DASHBOARD"
  | "DEAL"
  | "LEAD"
  | "PRODUCT"
  | "USER"
  | string; // Allow for custom pages

export interface Role {
  roleUUID: string;
  roleCode: RoleCode;
  roleName: string;
  isPrimary: boolean;
}

export interface Company {
  companyUUID: string;
  displayName: string;
  email: string;
  imagePath: string;
  isDefault: boolean;
  isPrimary: boolean;
  pageAccess: PageAccess[];
  roles: Role[];
}

export interface AuthUser {
  userUUID: string;
  fullName: string;
  email: string;
  image: string | null;
  companies: Company[];
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpires: number;
  expires: string;
  user: AuthUser;
}

// Permission types for feature-level access control
export type Permission = 
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "approve"
  | "reject";

export interface FeaturePermission {
  feature: string;
  permissions: Permission[];
}

// Authorization context type
export interface AuthorizationContext {
  currentCompany: Company | null;
  roles: Role[];
  pageAccess: PageAccess[];
  hasRole: (roleCode: RoleCode | RoleCode[]) => boolean;
  hasPageAccess: (page: PageAccess | PageAccess[]) => boolean;
  hasPermission: (feature: string, permission: Permission) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  switchCompany: (companyUUID: string) => Promise<void>;
}

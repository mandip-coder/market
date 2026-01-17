// Authorization constants

export const ROLES = {
  SUPER_ADMIN: "ROLE_SUPER_ADMIN",
  ADMIN: "ROLE_ADMIN",
  USER: "ROLE_USER",
  MANAGER: "ROLE_MANAGER",
} as const;

export const PAGES = {
  ADMINDASHBOARD: "ADMINDASHBOARD",
  USERDASHBOARD: "USERDASHBOARD",
  LEADS: "LEADS",
  DEALS: "DEALS",
  PRODUCTS: "PRODUCTS",
  HEALTCHARES: "HEALTCHARES",
  MASTER: {
    COMPANY: "COMPANY",
    USERS: "USERS",
    PRODUCT: "PRODUCT",
    ROLES: "ROLES",
  },
  CAMPAIGNS: "CAMPAIGNS",
} as const;

export const PERMISSIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  EXPORT: "export",
  IMPORT: "import",
  APPROVE: "approve",
  REJECT: "reject",
} as const;

// Page routes mapping to page access
// IMPORTANT: Keys MUST match the exact pageAccess values from backend
// Backend sends: COMPANY, DASHBOARD, PRODUCT, USER, LEAD, DEAL, etc.
export const PAGE_ROUTES: Record<string, string[]> = {
  // Backend page access values (as received from API)
  "DASHBOARD": ["/dashboard"],           // User dashboard
  "ADMINDASHBOARD": ["/admin"],          // Admin dashboard
  "LEAD": ["/leads"],                    // Backend sends "LEAD" not "LEADS"
  "DEAL": ["/deals"],                    // Backend sends "DEAL" not "DEALS"
  "PRODUCT": ["/products"],              // Backend sends "PRODUCT" not "PRODUCTS"
  "HEALTHCARE": ["/healthcares"],        // Backend sends "HEALTHCARE"
  "CAMPAIGNS": ["/campaigns"],         // Campaigns
  "COMPANY": ["/master/company-master"], // Master - Company
  "USER": ["/master/user-management"],   // Master - Users (backend sends "USER")
  "PRODUCTMASTER": ["/master/product-master"], // Master - Product
  "ROLE": ["/master/roles-master"],      // Master - Roles
};



// Feature permissions mapping
export const FEATURE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  [ROLES.SUPER_ADMIN]: {
    "*": [
      "create",
      "read",
      "update",
      "delete",
      "export",
      "import",
      "approve",
      "reject",
    ],
  },
  [ROLES.ADMIN]: {
    [PAGES.MASTER.COMPANY]: ["create", "read", "update", "delete"],
    [PAGES.MASTER.USERS]: ["create", "read", "update", "delete"],
    [PAGES.MASTER.PRODUCT]: ["create", "read", "update", "delete", "export"],
    [PAGES.MASTER.ROLES]: ["create", "read", "update", "delete", "approve", "reject"],
    [PAGES.CAMPAIGNS]: ["create", "read", "update", "delete"],
  },
  [ROLES.MANAGER]: {
    [PAGES.MASTER.PRODUCT]: ["create", "read", "update", "export"],
    [PAGES.MASTER.ROLES]: ["create", "read", "update", "delete", "approve", "reject"],
    [PAGES.CAMPAIGNS]: ["create", "read", "update", "delete"],
  },
  [ROLES.USER]: {
    [PAGES.MASTER.PRODUCT]: ["read"],
    [PAGES.DEALS]: ["read", "create"],
    [PAGES.LEADS]: ["create", "read", "update"],
  },
};

export interface Company {
  companyUUID: string;
  displayName: string;
  legalName: string;
  shortName: string;
  address: string;
  webUrl: string;
  logoUrl?: string | null;
  imagePath?: string | null;
  email: string;
  phone1: string;
  phone2?: string | null;
  phone3?: string | null;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "deleted";
  roles: {
    roleUUID: string;
    roleName: string;
    description: string;
    roleCode: string;
    isSystemRole: boolean;
    status: "active" | "inactive";
  }[];
  products: {
    productUUID: string;
    productName: string;
  }[];
  rolesUUID?: string[];
  productsUUID?: string[];
}

export interface CompanyDataResponse {
  data: {
    companies: Company[];
    total: number;
    page: number;
    limit: number;
  };
}


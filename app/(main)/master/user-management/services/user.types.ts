import { Country } from "@/services/dropdowns/dropdowns.types";
import { Role } from "../../roles-master/services/roles.types";
import { Company } from "../../company-master/services/company.types";

export interface User {
  userUUID: string;
  fullName: string;
  empCode: string;
  firstName: string;
  lastName: string;
  loginUsername: string;
  email: string;
  phone1: string;
  phone1HasWhatsapp?: boolean;
  phone2: string;
  phone2HasWhatsapp?: boolean;
  phone3: string;
  phone3HasWhatsapp?: boolean;
  createdAt: string;
  lastLogIn: string;
  status: "active" | "inactive" | "locked" | "deleted";
  companies: CompanyAccess[];
  lockUntil?: string;
  initial: string;
  officePhone: string;
  password: string;
  countryAccess: Country[];
  countryAccessUUID: string[]; // Array of country UUIDs from API
  companyAccess: string[]; // Array of company UUIDs from API (already strings in response)
  profileImage: File | null;
  profileImageUrl: string | null;
  multiFactorLogin: boolean;
  loginUserName: string;
  categoryAccess: CategoryAccess[];
}
export interface CategoryAccess {
  categoryUUID: string;
  categoryName: string;
}

export interface UsersDataResponse {
  data: {
    users: User[];
    total: number;
    limit: number;
    page: number;
  };
}

export interface PaginationParams {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  status?: string[];
  search?: string;
}

export interface FetchParams {
  pagination?: PaginationParams;
  sorter?: any;
  filters?: any;
}

export interface CompanyAccess {
  companyUUID: string;
  displayName: string;
  roles: Role[];
}

export interface CompanyListResponse {
  data: {
    companies: Company[];
    total: number;
  };
}

export interface CountryListResponse {
  data: {
    countries: Country[];
  };
}

export interface UpdateAccess {
  userUUID: string;
  companyUUID: string;
  roles: string[];  // Array of role UUIDs
}

export interface AddAccessPayload {
  userUUID: string;
  companies: {
    companyUUID: string;
    roles: string[];  // Array of role UUIDs
  }[];
}



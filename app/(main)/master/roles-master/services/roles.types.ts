export interface Role {
  roleUUID: string;
  roleName: string;
  description: string;
  roleCode: string;
  isSystemRole: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface RoleDataResponse {
  data: Role[];
}

export interface PaginationParams {
  pageSize?: number;
  total?: number;
}

export interface FetchParams {
  pagination?: PaginationParams;
  sorter?: any;
  filters?: any;
}
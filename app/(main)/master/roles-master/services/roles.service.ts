import { apiClient } from "@/lib/apiClient/apiClient";
import { APIPATH } from "@/shared/constants/url";
import { Role, RoleDataResponse } from "./roles.types";

export const rolesService = {
  fetchRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<RoleDataResponse>(APIPATH.ROLES.GETROLES);
    return response.data;
  },

  deleteRole: async (roleUUID: string): Promise<void> => {
    await apiClient.delete(`${APIPATH.ROLES.DELETEROLE}${roleUUID}`);
  },

  deleteMultipleRoles: async (uuids: React.Key[]): Promise<void> => {
    await apiClient.post(APIPATH.ROLES.MUTLIPLEDELETEROLE, { uuids });
  },

  updateRoleStatus: async (roleUUID: string, status: Role['status']): Promise<void> => {
    await apiClient.patch(APIPATH.ROLES.UPDATESTATUS(roleUUID), { status });
  },

  createRole: async (role: Omit<Role, 'roleUUID' | 'createdAt' | 'updatedAt'>): Promise<Role> => {
    const response = await apiClient.post<{ data: Role; }>(
      APIPATH.ROLES.CREATEROLE,
      role
    );
    return response.data;
  },

  updateRole: async (roleUUID: string, role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.put<{ data: Role;}>(
      `${APIPATH.ROLES.UPDATEROLE}${roleUUID}`,
      role
    );
    return response.data;
  },
};

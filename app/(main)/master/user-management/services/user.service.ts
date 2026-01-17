import { apiClient } from "@/lib/apiClient/apiClient";
import { APIPATH } from "@/shared/constants/url";
import { AddAccessPayload, FetchUsersParams, UpdateAccess, User, UsersDataResponse } from "./user.types";

export const usersService = {
  fetchUsers: async (params?: FetchUsersParams): Promise<UsersDataResponse> => {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Pagination
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    // Sorting
    if (params?.sortField) {
      queryParams.append('sortField', params.sortField);
    }
    if (params?.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder === 'ascend' ? 'asc' : 'desc');
    }
    
    // Filtering
    if (params?.status && params.status.length > 0) {
      params.status.forEach(status => {
        queryParams.append('status', status);
      });
    }
    
    // Search
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    const queryString = queryParams.toString();
    const url = `${APIPATH.USERS.GETUSERS}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<UsersDataResponse>(url);
    return response;
  },
  delelteUser: async (userUUID: string) => {
    const response = await apiClient.delete<{ data: User }>(
      `${APIPATH.USERS.DELETEUSER}${userUUID}`
    );
    return response.data;
  },
  updateUser: async (userUUID: string, data: User): Promise<User> => {
    const response = await apiClient.put<{ data: User }>(
      `${APIPATH.USERS.UPDATEUSER}${userUUID}`,
      data
    );
    return response.data;
  },

  createUser: async (data: User) => {
    const response = await apiClient.post<{ data: User }>(
      `${APIPATH.USERS.CREATEUSER}`,
      data
    );
    return response.data;
  },
  statusSwitch: async (userUUID: string, newStatus: string) => {
    const response = await apiClient.patch<{ data: User }>(
      APIPATH.USERS.STATUSUPDATE(userUUID, newStatus)
    );
    return response.data;
  },
  updateAccess:async(payload:UpdateAccess)=>{
    const response = await apiClient.patch<{ data: UpdateAccess }>(
      APIPATH.USERS.ACCESS.UPDATEACCESS(payload.userUUID,payload.companyUUID),
      payload
    );
    return response.data;
  },
  removeAccess:async(userUUID:string,companyUUID:string)=>{
    const response = await apiClient.delete<{ data: User }>(
      APIPATH.USERS.ACCESS.REMOVEACCESS(userUUID,companyUUID)
    );
    return response.data;
  },
  addAccess:async(payload:AddAccessPayload)=>{
    const response = await apiClient.post<{ data: User }>(
      APIPATH.USERS.ACCESS.ADDACCESS(payload.userUUID),
      payload
    );
    return response.data;
  },
};

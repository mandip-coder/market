import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { usersKeys } from "./user.keys";
import { usersService } from "./user.service";
import { AddAccessPayload, FetchUsersParams, UpdateAccess, User, UsersDataResponse } from "./user.types";
import { toast } from '@/components/AppToaster/AppToaster';

export function useFetchUsers(
  params?: FetchUsersParams,
  options?: Omit<
    UseQueryOptions<UsersDataResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersService.fetchUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: User) => usersService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("User added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, userUUID }: { payload: User; userUUID: string }) =>
      usersService.updateUser(userUUID, payload),
    onSuccess: () => {
      // Invalidate all user list queries to refetch with current pagination
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userUUID: string) => usersService.delelteUser(userUUID),
    onSuccess: () => {
      // Invalidate all user list queries to refetch with current pagination
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}
export function useSwitchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userUUID,
      newStatus,
    }: {
      userUUID: string;
      newStatus: string;
    }) => usersService.statusSwitch(userUUID, newStatus),
    onSuccess: () => {
      // Invalidate all user list queries to refetch with current pagination
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("User status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });
}

export function useAddAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddAccessPayload) => usersService.addAccess(payload),
    onSuccess: () => {
      // Invalidate all user list queries to refetch with current pagination
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("User access added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add user access");
    },
  });
}

export function useRemoveAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userUUID,
      companyUUID,
    }: {
      userUUID: string;
      companyUUID: string;
    }) => usersService.removeAccess(userUUID, companyUUID),
    onSuccess: () => {
      // Invalidate all user list queries to refetch with current pagination
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("User access removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove user access");
    },
  });
}

export function useUpdateAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAccess) => usersService.updateAccess(payload),
    onSuccess: () => {
      // Invalidate all user list queries to refetch with current pagination
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("User access updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user access");
    },
  });
}

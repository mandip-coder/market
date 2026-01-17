import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from '@/components/AppToaster/AppToaster';
import { rolesKeys } from "./roles.keys";
import { rolesService } from "./roles.service";
import { Role } from "./roles.types";

export function useRoles() {
  return useQuery({
    queryKey: rolesKeys.lists(),
    queryFn: () => rolesService.fetchRoles(),
    staleTime: 60 * 60000,
    gcTime: 60 * 60000,
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleUUID: string) => rolesService.deleteRole(roleUUID),
    onSuccess: (_, roleUUID) => {
      queryClient.setQueriesData({ queryKey: rolesKeys.lists() }, (old: Role[]) => {
        if (!old) return old;
        return old.filter((role) => role.roleUUID !== roleUUID);
      });
      toast.success("Role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete role");
    },
  });
}

export function useDeleteMultipleRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuids: React.Key[]) => rolesService.deleteMultipleRoles(uuids),
    onSuccess: (_, uuids) => {
      queryClient.setQueriesData({ queryKey: rolesKeys.lists() }, (old: Role[]) => {
        if (!old) return old;
        return old.filter((role) => !uuids.includes(role.roleUUID));
      });
      toast.success("Roles deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete roles");
    },
  });
}

export function useUpdateRoleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleUUID, status }: { roleUUID: string; status: Role['status'] }) =>
      rolesService.updateRoleStatus(roleUUID, status),
    onSuccess: (_, { roleUUID, status }) => {
      queryClient.setQueriesData({ queryKey: rolesKeys.lists() }, (old: Role[]) => {
        if (!old) return old;
        return old.map((role) =>
          role.roleUUID === roleUUID ? { ...role, status } : role
        );
      });
      toast.success("Status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Omit<Role, 'roleUUID' | 'createdAt' | 'updatedAt'>) =>
      rolesService.createRole(role),
    onSuccess: (newRole) => {
      queryClient.setQueriesData({ queryKey: rolesKeys.lists() }, (old: Role[]) => {
        if (!old) return [newRole];
        return [...old, newRole];
      });
      toast.success("Role created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create role. Please try again.");
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleUUID, role }: { roleUUID: string; role: Partial<Role> }) =>
      rolesService.updateRole(roleUUID, role),
    onSuccess: (updatedRole) => {
      queryClient.setQueriesData({ queryKey: rolesKeys.lists() }, (old: Role[]) => {
        if (!old) return old;
        return old.map((role) =>
          role.roleUUID === updatedRole.roleUUID ? updatedRole : role
        );
      });
      toast.success("Role updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update role. Please try again.");
    },
  });
}

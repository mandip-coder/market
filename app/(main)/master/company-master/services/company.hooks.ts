import { dropdownKeys } from "@/services/dropdowns/dropdowns.queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from '@/components/AppToaster/AppToaster';
import { companyKeys } from "./company.keys";
import { companyService } from "./company.service";
import { Company } from "./company.types";

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: () => companyService.fetchCompanies(),
    staleTime: 60 * 60000, 
    gcTime: 60 * 60000, 
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyData: Company) => companyService.createCompany(companyData),
    onSuccess: (data) => {
      queryClient.setQueriesData(
        { queryKey: companyKeys.lists() },
        (old: Company[] | undefined) => {
          if (!old) return []
          return [...old, data];
        }
      );
      queryClient.invalidateQueries({ queryKey: dropdownKeys.companies() });
      toast.success("Company created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create company");
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyUUID: string) => companyService.deleteCompany(companyUUID),
    onSuccess: (_, companyUUID) => {
      queryClient.setQueriesData({ queryKey: companyKeys.lists() }, (old: Company[]) => {
        if (!old) return old;
        return old.filter((company) => company.companyUUID !== companyUUID);
      });
      queryClient.invalidateQueries({ queryKey: dropdownKeys.companies() });
      toast.success("Company deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete company");
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyUUID,
      companyData,
    }: {
      companyUUID: string;
      companyData: Company;
    }) => companyService.updateCompany(companyUUID, companyData),
    onSuccess: (data) => {
      queryClient.setQueriesData(
        { queryKey: companyKeys.lists() },
        (old: Company[] | undefined) => {
          if (!old) return []
          return old.map((company) =>
            company.companyUUID === data.companyUUID ? data : company
          );
        }
      );
      queryClient.invalidateQueries({ queryKey: dropdownKeys.companies() });
      toast.success("Company updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update company");
    },
  });
}


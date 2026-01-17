"use client";

import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { toast } from '@/components/AppToaster/AppToaster';
import { contactPerosonsService } from "../contactPersons/contactPerons.service";
import { contactPersonsKeys } from "../contactPersons/contactPersonsKeys";
import { dropdownKeys } from "./dropdowns.queryKeys";
import { dropdownsService } from "./dropdowns.service";
import { healthcaresKeys } from "@/app/(main)/healthcares/services/healthcares.queryKeys";
import { Country, HCOType, ICB, LeadSource, PersonalityTrait, User, Product, Healthcare, RegionalOffice, Role, TherapeuticArea, LossReason, DealStage, ProductDocumentCategory, Region, HCOService, ICBWithUUID } from "./dropdowns.types";

/** 
 * Hook to fetch HCO list
 * Cached with infinite stale time - data rarely changes
 */
export function useHCOList(options?: Omit<UseQueryOptions<Healthcare[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.hcoList(),
    queryFn: () => dropdownsService.fetchHCOList(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

export function useHCOTypes(options?: Omit<UseQueryOptions<HCOType[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.hcoTypes(),
    queryFn: () => dropdownsService.fetchHCOTypes(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

export function useDropdownContactPersons(hcoUUID: string, enabled = true) {
  return useQuery({
    queryKey: dropdownKeys.contactsPersons(hcoUUID),
    queryFn: () => dropdownsService.fetchContactsPersons(hcoUUID),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!hcoUUID && enabled,
  });
}
export function useCreateContactPerson(hcoUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HCOContactPerson) =>
      contactPerosonsService.createContactPerson(data),
    onSuccess: (newContactPerson: HCOContactPerson) => {
      queryClient.setQueryData<HCOContactPerson[]>(
        dropdownKeys.contactsPersons(hcoUUID),
        (old = []) => {
          return [...old, newContactPerson];
        }
      );

      queryClient.setQueryData<HCOContactPerson[]>(
        contactPersonsKeys.contactsPersons(hcoUUID),
        (old = []) => {
          return [newContactPerson, ...old];
        }
      );
      queryClient.setQueryData<HCOContactPerson[]>(
        healthcaresKeys.contacts(hcoUUID),
        (old = []) => {
          return [...old, newContactPerson];
        }
      );
      queryClient.setQueryData(
        healthcaresKeys.lists(),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              list: old.data.list.map((healthcare: any) =>
                healthcare.hcoUUID === hcoUUID
                  ? {
                    ...healthcare,
                    totalContactsCount: healthcare.totalContactsCount + 1,
                    totalActiveContactsCount: healthcare.totalActiveContactsCount + 1,
                  }
                  : healthcare
              ),
            },
          };
        }
      );

      // Update healthcare detail cache - increment counts
      queryClient.setQueryData(
        healthcaresKeys.detail(hcoUUID),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            totalContactsCount: old.totalContactsCount + 1,
            totalActiveContactsCount:
              newContactPerson.status === 'active'
                ? old.totalActiveContactsCount + 1
                : old.totalActiveContactsCount,
          };
        }
      );

      // Update healthcare list cache - increment counts
      queryClient.setQueriesData(
        { queryKey: healthcaresKeys.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              list: old.data.list.map((healthcare: any) =>
                healthcare.hcoUUID === hcoUUID
                  ? {
                    ...healthcare,
                    totalContactsCount: healthcare.totalContactsCount + 1,
                    totalActiveContactsCount:
                      newContactPerson.status === 'active'
                        ? healthcare.totalActiveContactsCount + 1
                        : healthcare.totalActiveContactsCount,
                  }
                  : healthcare
              ),
            },
          };
        }
      );

      toast.success("Contact Person created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create contact person");
    },
  });
}
export function useUpdateContactPerson(hcoUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HCOContactPerson) =>
      contactPerosonsService.updateContactPerson(data),
    onSuccess: (updatedContactPerson: HCOContactPerson, variables: HCOContactPerson) => {
      const oldStatus = variables.status;
      const newStatus = updatedContactPerson.status;
      const statusChanged = oldStatus !== newStatus;

      // Update dropdown cache - replace existing contact
      queryClient.setQueryData<HCOContactPerson[]>(
        dropdownKeys.contactsPersons(hcoUUID),
        (old = []) => {
          return old.map((contact) =>
            contact.hcoContactUUID === updatedContactPerson.hcoContactUUID
              ? updatedContactPerson
              : contact
          );
        }
      );
      queryClient.setQueryData<HCOContactPerson[]>(
        contactPersonsKeys.contactsPersons(hcoUUID),
        (old = []) => {
          return old.map((contact) =>
            contact.hcoContactUUID === updatedContactPerson.hcoContactUUID
              ? updatedContactPerson
              : contact
          );
        }
      );

      // Update healthcare detail cache - update active count if status changed
      if (statusChanged) {
        queryClient.setQueryData(
          healthcaresKeys.detail(hcoUUID),
          (old: any) => {
            if (!old) return old;
            const increment = newStatus === 'active' ? 1 : -1;
            return {
              ...old,
              totalActiveContactsCount: Math.max(0, old.totalActiveContactsCount + increment),
            };
          }
        );

        // Update healthcare list cache
        queryClient.setQueriesData(
          { queryKey: healthcaresKeys.lists() },
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                list: old.data.list.map((healthcare: any) =>
                  healthcare.hcoUUID === hcoUUID
                    ? {
                      ...healthcare,
                      totalActiveContactsCount: Math.max(
                        0,
                        healthcare.totalActiveContactsCount + (newStatus === 'active' ? 1 : -1)
                      ),
                    }
                    : healthcare
                ),
              },
            };
          }
        );
      }

      toast.success("Contact Person updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update contact person");
    },
  });
}
/**
 * Hook to fetch lead sources
 * Cached with infinite stale time - data rarely changes
 */
export function useLeadSources(options?: Omit<UseQueryOptions<LeadSource[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.leadSources(),
    queryFn: () => dropdownsService.fetchLeadSources(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

/**
 * Hook to fetch personality traits
 * Cached with infinite stale time - data rarely changes
 */
export function usePersonalityTraits(options?: Omit<UseQueryOptions<PersonalityTrait[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.personalityTraits(),
    queryFn: () => dropdownsService.fetchPersonalityTraits(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

/**
 * Hook to fetch users list
 * Cached with infinite stale time - data rarely changes
 */
export function useUsers(options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.users(),
    queryFn: () => dropdownsService.fetchUsers(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

/**
 * Hook to fetch products list
 * Cached with infinite stale time - data rarely changes
 */
export function useProducts(options?: Omit<UseQueryOptions<Product[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.products(),
    queryFn: () => dropdownsService.fetchProducts(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

/**
 * Hook to fetch outcomes list
 * Cached with infinite stale time - data rarely changes
 */
export function useOutcomes() {
  return useQuery({
    queryKey: dropdownKeys.outcomes(),
    queryFn: () => dropdownsService.fetchOutcomes(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useCountry(options?: Omit<UseQueryOptions<Country[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.countryList(),
    queryFn: () => dropdownsService.fetchCountryList(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}
export function useCountryStates(countryUUID: string) {
  return useQuery({
    queryKey: dropdownKeys.states(countryUUID),
    queryFn: () => dropdownsService.fetchStates(countryUUID),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!countryUUID,
  });
}
export function useStatesCities(stateUUID: string) {
  return useQuery({
    queryKey: dropdownKeys.cities(stateUUID),
    queryFn: () => dropdownsService.fetchCities(stateUUID),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!stateUUID,
  });
}
export function useCompanies() {
  return useQuery({
    queryKey: dropdownKeys.companies(),
    queryFn: () => dropdownsService.fetchCompanies(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: dropdownKeys.countries(),
    queryFn: () => dropdownsService.fetchCountries(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useRoles(options?: Omit<UseQueryOptions<Role[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.roles(),
    queryFn: () => dropdownsService.fetchRoles(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}
export function useTherapeuticAreas(options?: Omit<UseQueryOptions<TherapeuticArea[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.therapeuticAreas(),
    queryFn: () => dropdownsService.fetchTherapeuticAreas(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

export function useRegionalOffices(options?: Omit<UseQueryOptions<RegionalOffice[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.regionalOffices(),
    queryFn: () => dropdownsService.fetchRegionalOffices(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

export function useICBs(options?: Omit<UseQueryOptions<ICB[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.icbs(),
    queryFn: () => dropdownsService.fetchICBs(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}
export function useDropdownLossReasons(options?: Omit<UseQueryOptions<LossReason[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.lossReasons(),
    queryFn: () => dropdownsService.fetchLossReasons(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

export function useDropdownDealStages(options?: Omit<UseQueryOptions<DealStage[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.dealStages(),
    queryFn: () => dropdownsService.fetchDealStages(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

export function useDropdownProductDocumentCategories(options?: Omit<UseQueryOptions<ProductDocumentCategory[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.productDocumentCategories(),
    queryFn: () => dropdownsService.fetchProductDocumentCategories(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}

export function useRegions(options?: Omit<UseQueryOptions<Region[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.regions(),
    queryFn: () => dropdownsService.fetchRegions(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}
export function useICBList(options?: Omit<UseQueryOptions<ICBWithUUID[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.icbList(),
    queryFn: () => dropdownsService.fetchICBSList(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}
export function useHcoServices(options?: Omit<UseQueryOptions<HCOService[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: dropdownKeys.services(),
    queryFn: () => dropdownsService.fetchHCOServices(),
    staleTime: Infinity,
    gcTime: Infinity,
    ...options
  });
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactPersonsKeys } from "./contactPersonsKeys";
import { contactPerosonsService } from "./contactPerons.service";

export function useContactsPersons(hcoUUID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: contactPersonsKeys.contactsPersons(hcoUUID),
    queryFn: () => contactPerosonsService.fetchContactsPersons(hcoUUID),
    staleTime: Infinity, 
    gcTime: Infinity, 
    enabled: !!hcoUUID && enabled,
  });
}

export function useDeleteContactPerson(hcoUUID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hcoContactUUID: string) => 
      contactPerosonsService.deleteContactPerson(hcoContactUUID),
    onSuccess: () => {
      // Invalidate and refetch the contacts list after successful deletion
      queryClient.invalidateQueries({
        queryKey: contactPersonsKeys.contactsPersons(hcoUUID),
      });
    },
  });
}

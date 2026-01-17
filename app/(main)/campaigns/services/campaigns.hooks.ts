import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCampaigns, fetchContactPersons, postMassEmail, fetchMassEmailICBs, fetchMassEmailHCOs } from "./campaigns.service";
import { massEmailKeys } from "./campaigns.queryKeys";
import { toast } from '@/components/AppToaster/AppToaster';
import { CreateCampaignsPayload, CampaignFilters } from "../types";

export function useCampaigns() {
    return useQuery({
        queryKey: massEmailKeys.campaigns(),
        queryFn: () => fetchCampaigns(),
    });
}

export function usePostMassEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCampaignsPayload) => postMassEmail(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: massEmailKeys.campaigns() });
            toast.success("Mass email campaign sent successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send mass email campaign");
        },
    });
}


export function useContactPersons(params?: CampaignFilters, enabled: boolean = true) {
    return useQuery({
        queryKey: massEmailKeys.contactPersons(params),
        queryFn: () => fetchContactPersons(params),
        enabled: enabled,
    });
}

export function useMassEmailICBs(regionsUUID: string[], enabled: boolean = true) {
    return useQuery({
        queryKey: massEmailKeys.icbs(regionsUUID),
        queryFn: () => fetchMassEmailICBs(regionsUUID),
        enabled: enabled,
        staleTime: Infinity,
        gcTime: Infinity,
    });
}

export function useMassEmailHCOs(params: { icbIds: string[] }, enabled: boolean = true) {
    return useQuery({
        queryKey: massEmailKeys.hcos(params),
        queryFn: () => fetchMassEmailHCOs(params),
        enabled: enabled,
        staleTime: Infinity,
        gcTime: Infinity,
    });
}
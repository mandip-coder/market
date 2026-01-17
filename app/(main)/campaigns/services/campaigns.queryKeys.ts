import { CampaignFilters } from "../types";

export const massEmailKeys = {
    all: ['massEmails'] as const,
    campaigns: () => [...massEmailKeys.all, 'campaigns'] as const,
    contactPersons: (params?: CampaignFilters) => [...massEmailKeys.all, 'contactPersons', params] as const,
    icbs: (regionsUUID?: string[]) => [...massEmailKeys.all, 'icbs', regionsUUID] as const,
    hcos: (params?: any) => [...massEmailKeys.all, 'hcos', params] as const,
};

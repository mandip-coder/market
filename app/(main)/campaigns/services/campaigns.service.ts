import { APIPATH } from "@/shared/constants/url";
import { apiClient } from "@/lib/apiClient/apiClient";
import { ContactPerson, CreateCampaignsPayload, Campaign, CampaignResponse, CampaignFilters } from "../types";

export const postMassEmail = async (data: CreateCampaignsPayload): Promise<CampaignResponse<Campaign>> => {
    const response = await apiClient.post<CampaignResponse<Campaign>>(APIPATH.MASSEMAILS.CREATEEMAILS, data);
    return response;
};

export const fetchCampaigns = async (): Promise<Campaign[]> => {
    const response = await apiClient.get<CampaignResponse<Campaign[]>>(APIPATH.MASSEMAILS.GETALLEMAILS);
    return response.data;
};

import { Healthcare, ICBWithUUID } from "@/services/dropdowns/dropdowns.types";

export const fetchContactPersons = async (params?: CampaignFilters): Promise<ContactPerson[]> => {
    const response = await apiClient.post<{ data: ContactPerson[] }>(APIPATH.DROPDOWN.MASSEMAIL_CONTACTPERSONS, params);
    return response.data;
}

export const fetchMassEmailICBs = async (regionsUUID: string[]): Promise<ICBWithUUID[]> => {
    const response = await apiClient.post<{ data: ICBWithUUID[] }>(APIPATH.DROPDOWN.ICBDROPDOWN,
        { regionsUUID: regionsUUID }
    );
    return response.data;
};

export const fetchMassEmailHCOs = async (params: { icbIds: string[] }): Promise<Healthcare[]> => {
    const response = await apiClient.post<{ data: Healthcare[] }>(APIPATH.DROPDOWN.HCOWITHICBUUID,
        params
    );
    return response.data;
};
import { apiClient } from '@/lib/apiClient/apiClient';
import { APIPATH } from '@/shared/constants/url';
import { HealthcareFilters, HealthcaresResponse, CreateHealthcareData, UpdateHealthcareData, Healthcare } from './types';
import { Deal } from '../../deals/services/deals.types';

/**
 * Healthcares API Service
 * Encapsulates all healthcare-related API calls
 */
export const healthcaresService = {
  /**
   * Fetch paginated healthcares with filters
   */
  fetchHealthcares: async (filters: HealthcareFilters): Promise<HealthcaresResponse> => {
    const { page, pageSize, searchQuery, typeFilter, countryUUID, regionalOfficeCode, icbCode } = filters;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });

    if (searchQuery) {
      queryParams.append('search', searchQuery);
    }
    if (typeFilter) {
      queryParams.append('hcoTypeUUID', typeFilter);
    }
    if (countryUUID) {
      queryParams.append('countryUUID', countryUUID);
    }
    if (regionalOfficeCode) {
      queryParams.append('regionalOfficeCode', regionalOfficeCode);
    }
    if (icbCode) {
      queryParams.append('icbCode', icbCode);
    }

    const response = await apiClient.get<HealthcaresResponse>(
      `${APIPATH.HCO.GETHEALTHCARES}?${queryParams.toString()}`
    );

    return response;
  },

  /**
   * Fetch individual healthcare by ID
   */
  fetchHealthcareById: async (id: string): Promise<Healthcare> => {
    const response = await apiClient.get<{ data: Healthcare }>(APIPATH.HCO.GETHEALTHCARE + id);
    return response.data;
  },

  /**
   * Create a new healthcare
   */
  createHealthcare: async (data: CreateHealthcareData): Promise<Healthcare> => {
    const response = await apiClient.post<{ data: Healthcare }>(APIPATH.HCO.CREATEHEALTHCARE, data);
    return response.data;
  },

  /**
   * Update an existing healthcare
   */
  updateHealthcare: async (data: UpdateHealthcareData): Promise<Healthcare> => {
    const { hcoUUID, ...updateData } = data;
    const response = await apiClient.put<{ data: Healthcare }>(
      APIPATH.HCO.UPDATEHEALTHCARE + hcoUUID,
      updateData
    );
    return response.data;
  },

  /**
   * Delete a healthcare
   */
  deleteHealthcare: async (hcoUUID: string): Promise<void> => {
    await apiClient.delete(APIPATH.HCO.DELETEHEALTHCARE + hcoUUID);
  },

  /**
   * Update healthcare status
   */
  updateHealthcareStatus: async (hcoUUID: string, status: string): Promise<Healthcare> => {
    const response = await apiClient.patch<{ data: Healthcare }>(
      APIPATH.HCO.UPDATESTATUS(hcoUUID),
      { status }
    );
    return response.data;
  },

  fetchHCODeals: async (hcoUUID: string): Promise<Deal[]> => {
    const response = await apiClient.get<{ data: Deal[] }>(APIPATH.HCO.GETDEALS(hcoUUID));
    return response.data;
  },

  /**
   * Fetch HCOs by ICB Code (for recommendations)
   */
  fetchHCOsByICBCode: async (icbCode: string): Promise<Healthcare[]> => {
    const response = await apiClient.get<{ data: Healthcare[] }>(
      APIPATH.LEAD.RECOMMENDATIONWISEHCOLIST(icbCode)
    );
    return response.data;
  },
};

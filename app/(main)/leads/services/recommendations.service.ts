import { apiClient } from '@/lib/apiClient/apiClient';
import { APIPATH } from '@/shared/constants/url';
import { RecommendationsResponse } from '../(mainTabs)/@recommendations/types';

export interface RecommendationFilters {
  regionalOfficeCode?: string;
  icbCode?: string;
  countryUUID?: string;
  page: number;
  size: number;
}

/**
 * Recommendations API Service
 */
export const recommendationsService = {
  /**
   * Fetch paginated recommendations with filters
   */
  fetchRecommendations: async (filters: RecommendationFilters): Promise<RecommendationsResponse> => {
    const queryParams = new URLSearchParams({
      page: filters.page.toString(),
      size: filters.size.toString(),
    });

    if (filters.regionalOfficeCode) {
      queryParams.append('regionalOfficeCode', filters.regionalOfficeCode);
    }
    if (filters.icbCode) {
      queryParams.append('icbCode', filters.icbCode);
    }
    if (filters.countryUUID) {
      queryParams.append('countryUUID', filters.countryUUID);
    }

    const response = await apiClient.get<RecommendationsResponse>(
      `${APIPATH.LEAD.RECOMMENDATIONS}?${queryParams.toString()}`
    );

    return response;
  },

  /**
   * Apply a recommendation (mark as suggestion applied)
   */
  applyRecommendation: async (recommendationUUID: string): Promise<void> => {
    await apiClient.patch(
      APIPATH.LEAD.APPLYRECOMMENDATION(recommendationUUID),
      { isSuggestionApplied: true }
    );
  },
};

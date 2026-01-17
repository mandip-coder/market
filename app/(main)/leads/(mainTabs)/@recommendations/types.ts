export interface Recommendation {
  recommendedUUID: string;
  countryName: string;
  hcoCount: number;
  icbCode: string;
  icbName: string;
  productName: string;
  regionalOfficeCode: string;
  regionalOfficeName: string;
}

export interface RecommendationsResponse {
  data: {
    filteredCount: number;
    hasNext: boolean;
    page: number;
    totalCount: number;
    list: Recommendation[];
  };
}

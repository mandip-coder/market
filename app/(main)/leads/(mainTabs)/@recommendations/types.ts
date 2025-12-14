import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";

export interface RecommendationProduct {
  productUUID: string;
  productName: string;
  dealCount: number;
}


export interface Recommendation {
  suggestionId: string;
  hcoUUID: string;
  hcoName: string;
  leadSource: string;
  summary: string;
  products: RecommendationProduct[];
  contactPersons: HCOContactPerson[];
}

export interface RecommendationsResponse {
  data: Recommendation[];
}

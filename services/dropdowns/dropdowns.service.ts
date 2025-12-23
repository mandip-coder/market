import { APIPATH } from "@/shared/constants/url";

import { apiClient } from "@/lib/apiClient/apiClient";
import { Healthcare } from "@/app/(main)/healthcares/lib/types";
import { LeadSource, Outcome, PersonalityTrait } from "./dropdowns.types";
import { User } from "@/app/(main)/master/user-management/components/UserDataTable";
import { Product } from "@/context/store/productStore";

class DropdownsService {

  async fetchHCOList(): Promise<Healthcare[]> {
    const response = await apiClient.get<{ data: Healthcare[] }>(APIPATH.DROPDOWN_MODULE.HCO);
    return response.data
  }


  async fetchLeadSources(): Promise<LeadSource[]> {
    const response = await apiClient.get<{ data: LeadSource[] }>(APIPATH.DROPDOWN.LEADSOURCE);
    return response.data;
  }


  async fetchPersonalityTraits(): Promise<PersonalityTrait[]> {
    const response = await apiClient.get<{ data: PersonalityTrait[] }>(APIPATH.DROPDOWN.PERSONALITYTRAITS);
    return response.data;
  }

  async fetchUsers(): Promise<User[]> {
    const response = await apiClient.get<{ data: User[] }>(APIPATH.DROPDOWN.USERS);
    return response.data;
  }


  async fetchProducts(): Promise<Product[]> {
    const response = await apiClient.get<{ data: Product[] }>(APIPATH.DROPDOWN.PRODUCTS);
    return response.data;
  }


  async fetchOutcomes(): Promise<Outcome[]> {
    const response = await apiClient.get<{ data: Outcome[] }>(APIPATH.DROPDOWN.OUTCOMES);
    return response.data;
  }
}

export const dropdownsService = new DropdownsService();

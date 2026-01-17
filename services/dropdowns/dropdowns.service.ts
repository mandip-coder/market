import { APIPATH } from "@/shared/constants/url";

import { apiClient } from "@/lib/apiClient/apiClient";
import { City, Company, Country, DealStage, HCOService, HCOType, Healthcare, ICB, ICBWithUUID, LeadSource, LossReason, Outcome, PersonalityTrait, ProductDocumentCategory, Region, RegionalOffice, Role, State, TherapeuticArea, User } from "./dropdowns.types";
import { Product } from "@/app/(main)/products/services/types";
import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";

class DropdownsService {

  async fetchHCOList(): Promise<Healthcare[]> {
    const response = await apiClient.get<{ data: Healthcare[] }>(APIPATH.DROPDOWN.HCOWITHICBUUID);
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
    const response = await apiClient.get<{ data: Product[] }>(APIPATH.DROPDOWN_MODULE.PRODUCTS);
    return response.data;
  }


  async fetchOutcomes(): Promise<Outcome[]> {
    const response = await apiClient.get<{ data: Outcome[] }>(APIPATH.DROPDOWN.OUTCOMES);
    return response.data;
  }

  async fetchContactsPersons(hcoUUID: string): Promise<HCOContactPerson[]> {
    const response = await apiClient.get<{ data: HCOContactPerson[] }>(APIPATH.DROPDOWN.CONTACTPERSONS(hcoUUID));
    return response.data.map((contact) => ({
      label: contact.fullName,
      value: contact.hcoContactUUID,
      ...contact
    }));
  }

  async fetchHCOTypes(): Promise<HCOType[]> {
    const response = await apiClient.get<{ data: HCOType[] }>(APIPATH.DROPDOWN.HCOTYPES);
    return response.data;
  }

  async fetchCountryList(): Promise<Country[]> {
    const response = await apiClient.get<{ data: Country[] }>(APIPATH.DROPDOWN_MODULE.COUNTRY);
    return response.data;
  }

  async fetchStates(countryUUID: string): Promise<State[]> {
    const response = await apiClient.get<{ data: State[] }>(APIPATH.DROPDOWN_MODULE.STATE(countryUUID));
    return response.data;
  }

  async fetchCities(stateUUID: string): Promise<City[]> {
    const response = await apiClient.get<{ data: City[] }>(APIPATH.DROPDOWN_MODULE.CITY(stateUUID));
    return response.data;
  }

  async fetchCompanies(): Promise<Company[]> {
    const response = await apiClient.get<{ data: { companies: Company[] } }>(APIPATH.COMPANY.GETCOMPANIES);
    return response.data.companies;
  }

  async fetchCountries(): Promise<Country[]> {
    const response = await apiClient.get<{ data: Country[] }>(APIPATH.DROPDOWN_MODULE.COUNTRY);
    return response.data;
  }
  async fetchRoles(): Promise<Role[]> {
    const response = await apiClient.get<{ data: Role[] }>(APIPATH.DROPDOWN_MODULE.ROLES);
    return response.data;
  }
  async fetchTherapeuticAreas(): Promise<TherapeuticArea[]> {
    const response = await apiClient.get<{ data: TherapeuticArea[] }>(APIPATH.DROPDOWN.THERAPEUTICAREAS);
    return response.data;
  }

  async fetchRegionalOffices(): Promise<RegionalOffice[]> {
    const response = await apiClient.get<{ data: RegionalOffice[] }>(APIPATH.DROPDOWN.REGIONALOFFICES);
    return response.data;
  }

  async fetchICBs(): Promise<ICB[]> {
    const response = await apiClient.get<{ data: ICB[] }>(APIPATH.DROPDOWN.ICBS);
    return response.data;
  }
  async fetchLossReasons(): Promise<LossReason[]> {
    const response = await apiClient.get<{ data: LossReason[] }>(APIPATH.DROPDOWN.LOSSREASONS);
    return response.data;
  }
  async fetchDealStages(): Promise<DealStage[]> {
    const response = await apiClient.get<{ data: DealStage[] }>(APIPATH.DROPDOWN.DEALSTAGES);
    return response.data;
  }
  async fetchProductDocumentCategories(): Promise<ProductDocumentCategory[]> {
    const response = await apiClient.get<{ data: ProductDocumentCategory[] }>(APIPATH.DROPDOWN_MODULE.PRODUCTSDOCUMENTCATEGORIES);
    return response.data;
  }
  async fetchHCOServices(): Promise<HCOService[]> {
    const response = await apiClient.get<{ data: HCOService[] }>(APIPATH.DROPDOWN.HCOSERVICES);
    return response.data;
  }
  async fetchICBSList(): Promise<ICBWithUUID[]> {
    const response = await apiClient.get<{ data: ICBWithUUID[] }>(APIPATH.DROPDOWN.ICBDROPDOWN);
    return response.data;
  }
  async fetchRegions(): Promise<Region[]> {
    const response = await apiClient.get<{ data: Region[] }>(APIPATH.DROPDOWN.REGION);
    return response.data;
  }
}

export const dropdownsService = new DropdownsService();

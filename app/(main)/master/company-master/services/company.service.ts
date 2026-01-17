import { apiClient } from "@/lib/apiClient/apiClient";
import { APIPATH } from "@/shared/constants/url";
import { Company, CompanyDataResponse } from "./company.types";

export const companyService = {
  fetchCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get<CompanyDataResponse>(
      APIPATH.COMPANY.GETCOMPANIES
    );
    return response.data.companies;
  },

  deleteCompany: async (companyUUID: string): Promise<void> => {
    await apiClient.delete(`${APIPATH.COMPANY.DELETECOMPANY}${companyUUID}`);
  },

  updateCompany: async (
    companyUUID: string,
    companyData: Company
  ): Promise<Company> => {
    const response = await apiClient.put<{ data: Company }>(
      `${APIPATH.COMPANY.UPDATECOMPANY}${companyUUID}`,
      companyData
    );
    return response.data;
  },

  createCompany: async (companyData: Company): Promise<Company> => {
    const response = await apiClient.post<{ data: Company }>(
      APIPATH.COMPANY.CREATECOMPANY,
      companyData
    );
    return response.data;
  },
};

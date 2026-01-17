import { APIPATH } from "@/shared/constants/url";

import { apiClient } from "@/lib/apiClient/apiClient";
import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";

class ContactPerosonsService {

  async fetchContactsPersons(hcoUUID: string): Promise<HCOContactPerson[]> {
    const response = await apiClient.get<{ data: HCOContactPerson[] }>(APIPATH.CONTACT.GETHCOCONTACT(hcoUUID));
    return response.data
  }

  async createContactPerson(data: HCOContactPerson): Promise<HCOContactPerson> {
    const response = await apiClient.post<{ data: HCOContactPerson }>(APIPATH.CONTACT.CREATECONTACT, data);
    return response.data
  }

  async updateContactPerson(data: HCOContactPerson): Promise<HCOContactPerson> {
    const response = await apiClient.put<{ data: HCOContactPerson }>(APIPATH.CONTACT.UPDATECONTACT+data.hcoContactUUID,data);
    return response.data
  }

  async deleteContactPerson(hcoContactUUID: string): Promise<void> {
    await apiClient.delete(APIPATH.CONTACT.DELETECONTACT+hcoContactUUID);
  }
}

export const contactPerosonsService = new ContactPerosonsService();

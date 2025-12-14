import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import { useApi } from "@/hooks/useAPI";
import { APIPATH } from "@/shared/constants/url";
import dayjs, { Dayjs } from "dayjs";

export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

export function toByte(value: number, unit: FileSizeUnit): number {
  const units: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB"];
  const index = units.indexOf(unit);
  if (index === -1) throw new Error("Invalid unit");
  return value * Math.pow(1024, index);
}

export function fromByte(bytes: number, unit: FileSizeUnit, asString?: boolean): string | number {
  const units: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB"];
  const index = units.indexOf(unit);
  if (index === -1) throw new Error("Invalid unit");
  const value = (bytes / Math.pow(1024, index)).toFixed(1);
  return asString ? `${value} ${unit}` : value;
}

export const fromDayjs = (date: Dayjs, format = "YYYY-MM-DD") => {
  return date.format(format)
}
export const toDayjs = (date: string, format = "YYYY-MM-DD") => {
  return dayjs(date, format);
}
export const GlobalDate = (date: string) => {
  if (!date) return 'Date Not Found';
  return dayjs(date).format('DD MMM, YYYY');
}

export const fetchContacts = async (API: ReturnType<typeof useApi>, value: string) => {
  if (value) {
    const response = await API.get(APIPATH.CONTACT.GETHCOCONTACT(value),);
    if (response) {
      const contacts = response.data as HCOContactPerson[];
      return contacts.map((contact) => ({
        label: contact.fullName,
        value: contact.hcoContactUUID,
        ...contact
      }));
    }
  } else {
    return [] as HCOContactPerson[]
  }
};
export const formatUserDisplay = (
  name: string | null | undefined,
  targetUserUUID: string | null | undefined,
  currentUserUUID: string | null | undefined
): string => {
  console.log(name, targetUserUUID, currentUserUUID);
  if (targetUserUUID && currentUserUUID && targetUserUUID === currentUserUUID) {
    return "You";
  }
  return name || "—";
};

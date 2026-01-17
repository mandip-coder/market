import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

export function toByte(value: number, unit: FileSizeUnit): number {
  const units: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB"];
  const index = units.indexOf(unit);
  if (index === -1) throw new Error("Invalid unit");
  return value * Math.pow(1024, index);
}

export function fromByte(
  bytes: number,
  unit: FileSizeUnit,
  asString?: boolean
): string | number {
  const units: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB"];
  const index = units.indexOf(unit);
  if (index === -1) throw new Error("Invalid unit");
  const value = (bytes / Math.pow(1024, index)).toFixed(1);
  return asString ? `${value} ${unit}` : value;
}

export const fromDayjs = (date: Dayjs, format = "YYYY-MM-DD") => {
  return date.format(format);
};
export const toDayjs = (date: string, format = "YYYY-MM-DD") => {
  return dayjs(date, format);
};

export const GlobalDate = (value?: string): string => {
  if (!value) return "Date Not Found";

  // ✅ Check time-only (HH:mm)
  const isTimeOnly = /^\d{1,2}:\d{2}$/.test(value);

  if (isTimeOnly) {
    const time = dayjs(value, "HH:mm");
    return time.isValid() ? time.format("hh:mm A") : value;
  }

  const date = dayjs(value);

  if (!date.isValid()) return "Invalid Date";

  return date.format("DD MMM, YYYY");
};

export const formatUserDisplay = (
  name: string | null | undefined,
  targetUserUUID: string | null | undefined,
  currentUserUUID: string | null | undefined
): string => {
  if ((targetUserUUID && currentUserUUID) && (targetUserUUID === currentUserUUID)) {
    return "You";
  }
  return name || "—";
};

export const formatMeetingDate = (datetime: string) => {
  const meetingDate = dayjs(datetime);
  const today = dayjs();
  const tomorrow = dayjs().add(1, "day");
  const afterTomorrow = dayjs().add(2, "day");
  try {

    if (meetingDate.isSame(today, "day")) {
      return "Today";
    } else if (meetingDate.isSame(tomorrow, "day")) {
      return "Tomorrow";
    } else if (meetingDate.isSame(afterTomorrow, "day")) {
      return "After Tomorrow";
    } else {
      return meetingDate.format("DD MMM, YYYY");
    }
  } catch (e) {
    return datetime;
  }
};

export const contactDropDownFilter = (input: string, option: any) => {
  return option?.contact?.fullName.toLowerCase().includes(input.toLowerCase()) || option?.contact?.email.toLowerCase().includes(input.toLowerCase()) || option?.contact?.phone.toLowerCase().includes(input.toLowerCase()) || option?.contact?.role.toLowerCase().includes(input.toLowerCase())
}

export const getStageColor = (stageName: string): string => {
  const name = stageName?.toLowerCase() || "";
  if (name.includes("discussion")) return "#1677FF";
  if (name.includes("negotiation")) return "#FAAD14";
  if (name.includes("won")) return "#52C41A";
  if (name.includes("lost")) return "#FF4D4F";
  return "#6b7280";
};


export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
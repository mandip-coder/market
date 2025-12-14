import { RATING_CLASS_COLORS, RATING_COLORS, TYPE_COLORS } from "./constants";

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const getRatingColor = (rating: string) => 
  RATING_COLORS[rating as keyof typeof RATING_COLORS] || 'default';

export const getTypeColor = (type: string) => 
  TYPE_COLORS[type as keyof typeof TYPE_COLORS] || 'default';

export const getRatingClassColor = (rating: string) => 
  RATING_CLASS_COLORS[rating as keyof typeof RATING_CLASS_COLORS] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

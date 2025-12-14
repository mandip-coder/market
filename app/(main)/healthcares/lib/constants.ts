export const HEALTHCARE_TYPES = ["NHS Trust", "Foundation Trust", "PCN"] as const;
export const RAG_RATINGS = ["Green", "Amber", "Red"] as const;

export const RATING_COLORS = {
  'Green': 'green',
  'Amber': 'orange',
  'Red': 'red',
} as const;

export const TYPE_COLORS = {
  'NHS Trust': 'blue',
  'Foundation Trust': 'purple',
  'PCN': 'cyan',
} as const;

export const RATING_CLASS_COLORS = {
  'Green': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Amber': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Red': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
} as const;

export const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  "Corporate": { bg: "bg-blue-50", text: "text-blue-700 dark:text-blue-400" },
  "Non-profit": { bg: "bg-green-50", text: "text-green-700 dark:text-green-400" },
  "Government": { bg: "bg-purple-50", text: "text-purple-700 dark:text-purple-400" },
  "Educational": { bg: "bg-yellow-50", text: "text-yellow-700 dark:text-yellow-400" },
  "Healthcare": { bg: "bg-red-50", text: "text-red-700 dark:text-red-400" },
};
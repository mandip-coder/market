import type { ThemeConfig } from "antd/es/config-provider/context";

export type ThemeMode = "light" | "dark";

// Common properties shared between both themes
const commonToken = {
  borderRadius: 16,
  borderRadiusLG: 24,
  borderRadiusSM: 12,
  borderRadiusXS: 8,
  controlHeight: 35,
  fontSize: 14,
  fontFamily: "Inter,-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
};

// Define type for component configurations
type ComponentConfig = Record<string, any>;

// Common component configurations
const commonComponents: ComponentConfig = {

  Menu: {
    itemBg: "transparent",
    itemBorderRadius: 10,
    iconSize: 20,
    fontSize: 14,
  },
  Button: {
    controlHeight: 35,
    controlHeightLG: 52,
    controlHeightSM: 36,
    borderRadius: 14,
    borderRadiusLG: 16,
    borderRadiusSM: 10,
    fontWeight: 600,
  },
  Card: {
    borderRadiusLG: 12,
  },
  Table: {
    headerBorderRadius: 16,
  },
  Input: {
    borderRadius: 14,
    paddingInline: 10,
    controlHeight: 35,
  },
  InputNumber: {
    controlHeight: 35,
    borderRadius: 14,
  },
  Select: {
    controlHeight: 35,
    borderRadius: 14,
    borderRadiusLG: 16,
  },
  DatePicker: {
    controlHeight: 35,
    borderRadius: 14,
  },
  Switch: {
    handleSize: 26,
    trackHeight: 32,
    trackMinWidth: 56,
    innerMaxMargin: 28,
  },
  Radio: {
    radioSize: 22,
    dotSize: 12,
  },
  Checkbox: {
    borderRadiusSM: 4,
    controlInteractiveSize: 18,
  },
  Tooltip: {
    borderRadius: 12,
    sizePopupArrow: 18,
    borderRadiusXS: 2,
  },
  Popover: {
    borderRadiusXS: 2,
    sizePopupArrow: 25
  },
  Dropdown: {
    borderRadiusLG: 16,
    paddingBlock: 4,
  },
  Modal: {
    borderRadiusLG: 24,
  },
  Notification: {
    borderRadiusLG: 16,
  },
  Drawer: {
    paddingLG: 32,
  },
  Tag: {
    borderRadiusSM: 8,
  },

};

// Light theme specific values
const lightThemeToken = {
  colorPrimary: "#6366F1",
  colorSuccess: "#10B981",
  colorWarning: "#F59E0B",
  colorError: "#EF4444",
  colorTextBase: "#0F172A",
  colorTextSecondary: "#64748B",
  colorTextTertiary: "#94A3B8",
  colorBgBase: "#FFFFFF",
  colorBgContainer: "#FFFFFF",
  colorBgElevated: "#F8FAFC",
  colorBgLayout: "#F1F5F9",
  colorBorder: "#E2E8F0",
  colorBorderSecondary: "#F1F5F9",
  colorSplit: "#E2E8F0",
};

const lightThemeComponents: ComponentConfig = {
  Layout: {
    headerBg: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
    bodyBg: "#F1F5F9",
    siderBg: "#FFFFFF",
    triggerBg: "#F8FAFC",
    triggerColor: "#6366F1",
  },
  Menu: {
    itemColor: "#475569",
    itemHoverColor: "#6366F1",
    itemHoverBg: "#d5ddff",
    itemSelectedColor: "#6366F1",
    itemSelectedBg: "#d5ddff",
    itemActiveBg: "#d5ddff",
  },
  Button: {
    defaultBg: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
    defaultBorderColor: "#E2E8F0",
    defaultColor: "#475569",
  },
  Card: {
    colorBgContainer: "#FFFFFF",
    colorBorderSecondary: "rgba(99, 102, 241, 0.08)",
  },
  Table: {
    headerBg: "#F8FAFC",
    headerColor: "#334155",
    headerSplitColor: "rgba(99, 102, 241, 0.06)",
    borderColor: "#E2E8F0",
    filterDropdownBg: "#FFFFFF",
  },
  Input: {
    colorBorder: "#E2E8F0",
    colorBgContainer: "#FFFFFF",
    activeBorderColor: "#6366F1",
    hoverBorderColor: "#818CF8",
    activeShadow: "0 0 0 4px rgba(99, 102, 241, 0.12)",
  },
  InputNumber: {
    colorBorder: "#E2E8F0",
    activeBorderColor: "#6366F1",
    hoverBorderColor: "#818CF8",
    activeShadow: "0 0 0 4px rgba(99, 102, 241, 0.12)",
  },
  Select: {
    colorBorder: "#E2E8F0",
    optionSelectedBg: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.1) 100%)",
    optionActiveBg: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)",
    optionSelectedColor: "#6366F1",
    activeOutlineColor: "rgba(99, 102, 241, 0.12)",
    controlOutlineWidth: 4
  },
  DatePicker: {
    colorBorder: "#E2E8F0",
    cellHoverBg: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
    cellActiveWithRangeBg: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.1) 100%)",
    cellBgDisabled: "#F8FAFC",
  },
  Switch: {
    colorPrimary: "#10B981",
    colorPrimaryHover: "#059669",
  },
  Radio: {
    colorPrimary: "#6366F1",
    colorBorder: "#CBD5E1",
  },
  Checkbox: {
    colorPrimary: "#6366F1",
    colorBorder: "#CBD5E1",
  },
  Tooltip: {
    colorBgSpotlight: "rgba(15, 23, 42, 0.96)",
  },
  Dropdown: {
    controlItemBgHover: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
    controlItemBgActive: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%)",
  },

  Drawer: {
    colorBgElevated: "#FFFFFF",
  },
  Divider: {
    colorSplit: "rgba(99, 102, 241, 0.1)",
  },
  Tag: {
    defaultBg: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)",
    defaultColor: "#475569",
  },
  Progress: {
    defaultColor: "#6366F1",
    remainingColor: "#E2E8F0",
  },

};

// Dark theme specific values
const darkThemeToken = {
  colorPrimary: "#818CF8",
  colorSuccess: "#34D399",
  colorWarning: "#FBBF24",
  colorError: "#F87171",
  colorTextBase: "#F1F5F9",
  colorTextSecondary: "#94A3B8",
  colorTextTertiary: "#64748B",
  colorBgBase: "#0A0A0F",
  colorBgContainer: "#1A1A2E",
  colorBgElevated: "#252540",
  colorBgLayout: "#050509",
  colorBorder: "#2D2D44",
  colorBorderSecondary: "#1F1F33",
  colorSplit: "#2D2D44",
};

const darkThemeComponents: ComponentConfig = {
  Layout: {
    headerBg: "linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 30, 0.95) 100%)",
    bodyBg: "#050509",
    siderBg: "#1A1A2E",
    triggerBg: "#252540",
    triggerColor: "#818CF8",
  },
  // Menu: {
  //   itemColor: "#94A3B8",
  //   itemHoverColor: "#A5B4FC",
  //   itemHoverBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(167, 139, 250, 0.12) 100%)",
  //   itemSelectedColor: "#C7D2FE",
  //   itemSelectedBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.25) 0%, rgba(167, 139, 250, 0.22) 100%)",
  //   itemActiveBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.3) 0%, rgba(167, 139, 250, 0.28) 100%)",
  // },
  Button: {
    primaryShadow: "0 4px 20px 0 rgba(129, 140, 248, 0.4), 0 8px 40px -8px rgba(167, 139, 250, 0.5)",
    defaultBg: "linear-gradient(135deg, #1A1A2E 0%, #252540 100%)",
    defaultBorderColor: "#2D2D44",
    defaultColor: "#94A3B8",
  },
  Card: {
    colorBgContainer: "#1A1A2E",
    colorBorderSecondary: "rgba(129, 140, 248, 0.12)",
  },
  Table: {
    headerBg: "#252540",
    headerColor: "#E2E8F0",
    headerSplitColor: "rgba(129, 140, 248, 0.1)",
    borderColor: "#2D2D44",
    filterDropdownBg: "#1A1A2E",
  },
  Input: {
    colorBgContainer: "#1A1A2E",
    colorBorder: "#2D2D44",
    activeBorderColor: "#818CF8",
    hoverBorderColor: "#A5B4FC",
    activeShadow: "0 0 0 4px rgba(129, 140, 248, 0.2)",
  },
  InputNumber: {
    colorBgContainer: "#1A1A2E",
    colorBorder: "#2D2D44",
    activeBorderColor: "#818CF8",
    hoverBorderColor: "#A5B4FC",
    activeShadow: "0 0 0 4px rgba(129, 140, 248, 0.2)",
  },
  Select: {
    colorBgContainer: "#1A1A2E",
    colorBorder: "#2D2D44",
    optionSelectedBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(167, 139, 250, 0.18) 100%)",
    optionActiveBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.12) 0%, rgba(167, 139, 250, 0.1) 100%)",
    optionSelectedColor: "#C7D2FE",
    activeOutlineColor: "rgba(129, 140, 248, 0.2)",
    controlOutlineWidth: 4
  },
  DatePicker: {
    colorBgContainer: "#1A1A2E",
    colorBorder: "#2D2D44",
    cellHoverBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.12) 0%, rgba(167, 139, 250, 0.12) 100%)",
    cellActiveWithRangeBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(167, 139, 250, 0.18) 100%)",
    cellBgDisabled: "#0F0F1E",
  },
  Switch: {
    colorPrimary: "#34D399",
    colorPrimaryHover: "#6EE7B7",
  },
  Radio: {
    colorPrimary: "#818CF8",
    colorBorder: "#3D3D5C",
  },
  Checkbox: {
    colorPrimary: "#818CF8",
    colorBorder: "#3D3D5C",
  },
  Tooltip: {
    colorBgSpotlight: "rgba(37, 37, 64, 0.98)",
  },
  Dropdown: {
    colorBgElevated: "#252540",
    controlItemBgHover: "linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(167, 139, 250, 0.12) 100%)",
    controlItemBgActive: "linear-gradient(135deg, rgba(129, 140, 248, 0.25) 0%, rgba(167, 139, 250, 0.22) 100%)",
  },

  Notification: {
    colorBgElevated: "#252540",
  },
  Drawer: {
    colorBgElevated: "#1A1A2E",
  },
  Divider: {
    colorSplit: "rgba(129, 140, 248, 0.15)",
  },
  Tag: {
    defaultBg: "linear-gradient(135deg, #252540 0%, #2D2D44 100%)",
    defaultColor: "#94A3B8",
  },
  Progress: {
    defaultColor: "#818CF8",
    remainingColor: "#2D2D44",
  },

};

// Helper function to merge component configurations
const mergeComponents = (
  common: ComponentConfig,
  specific: ComponentConfig
): ComponentConfig => {
  const result: ComponentConfig = {};

  // Get all component keys from both common and specific
  const allKeys = new Set([...Object.keys(common), ...Object.keys(specific)]);

  // Merge each component
  allKeys.forEach(key => {
    result[key] = {
      ...common[key],
      ...specific[key],
    };
  });

  return result;
};

// Create the final theme configurations
export const DefaultTheme: Record<ThemeMode, ThemeConfig> = {
  light: {
    token: {
      ...commonToken,
      ...lightThemeToken,
    },
    components: mergeComponents(commonComponents, lightThemeComponents),
  },
  dark: {
    token: {
      ...commonToken,
      ...darkThemeToken,
    },
    components: mergeComponents(commonComponents, darkThemeComponents),
  },
};
export const rowGutter: [number, number] = [16, 16];
export const columnsConfig = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8
}

export const statusColorsConfig: Record<string, string> = {
  "In Progress": "geekblue",
  "Completed": "green",
  "Hold": "orange",
  "Rejected": "red",
  "Pending": "blue",
}
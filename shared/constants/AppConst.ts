import type { MenuProps } from "antd";
import {
  Accessibility,
  Activity,
  Archive,
  Bolt,
  Boxes,
  Building,
  Building2,
  FileText,
  Grip,
  Handshake,
  HeartHandshake,
  HeartPulse,
  Info,
  LayoutDashboard,
  Mailbox,
  Microscope,
  PackageSearch,
  Search,
  User,
  UserRoundCog,
  UsersRound,
  WandSparkles
} from "lucide-react";
import React from "react";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  link: string,
  Icon: React.ElementType,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key: link,
    icon: React.createElement(Icon, { size: 20, }),
    children,
    label,
    type,
  } as MenuItem;
}


// Base menu items shared between both menus
const baseMenuItems = [
  getItem("Dashboard", "/dashboard", LayoutDashboard),
  getItem("Leads", "/leads",Search),
  getItem("Deals", "/deals",HeartHandshake),
  getItem("Healthcares", "/healthcares", Building2,),
  getItem("Products", "/products", Boxes,),

];

const masterMenuItems = [
  getItem("Users", "/master/user-management", UserRoundCog),
  getItem("Products", "/master/product-master", PackageSearch),
  getItem("Company", "/master/company-master", Building),
  getItem("Roles", "/master/roles-master", Bolt),
  getItem("Mass Emails", "/master/mass-emails", Mailbox),
];

export const userMenu: MenuItem[] = [
  {
    type: "group",
    key: "main-menu",
    label: "Main Menu",
    children: baseMenuItems,
  },
];

export const mainMenu: MenuItem[] = [
  {
    type: "group",
    key: "main-menu",
    label: "Main Menu",
    children: [
      ...baseMenuItems,
      getItem("Master", "/master", Grip, masterMenuItems),
    ],
  },
];


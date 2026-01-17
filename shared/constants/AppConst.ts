import type { MenuProps } from "antd";
import {
  Bolt,
  Boxes,
  Building,
  Building2,
  Grip,
  HeartHandshake,
  LayoutDashboard,
  Mailbox,
  PackageSearch,
  Search,
  Shield,
  UserRoundCog
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
  getItem("Admin", "/admin", Shield),
  getItem("Dashboard", "/dashboard", LayoutDashboard),
  getItem("Prospects", "/leads", Search),
  getItem("Deals", "/deals", HeartHandshake),
  getItem("Healthcares", "/healthcares", Building2,),
  getItem("Products", "/products", Boxes,),
  getItem("Campaign", "/campaigns", Mailbox),

];

const masterMenuItems = [
  getItem("Users", "/master/user-management", UserRoundCog),
  getItem("Products", "/master/product-master", PackageSearch),
  getItem("Company", "/master/company-master", Building),
  getItem("Roles", "/master/roles-master", Bolt),
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


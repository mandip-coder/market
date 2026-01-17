"use client";
import { getCurrentCompany, getCurrentPageAccess } from "@/lib/authorization";
import { PAGE_ROUTES } from "@/lib/authorization/constants";
import { mainMenu } from "@/shared/constants/AppConst";
import { PageAccess } from "@/types/authorization";
import type { MenuProps } from "antd";
import { useMemo } from "react";
import { useLoginUser } from "./useToken";

type MenuItem = Required<MenuProps>["items"][number];

export default () => {
  const loginUser = useLoginUser();
  const currentCompany = getCurrentCompany(loginUser?.companies || []);
  const currentPageAccess = getCurrentPageAccess(currentCompany);

  const isRouteAccessible = (route: string, pageAccess: PageAccess[]): boolean => {
    // If no page access, deny all routes
    if (!pageAccess || pageAccess.length === 0) return false;

    // Check if the route matches any accessible page
    for (const [page, routes] of Object.entries(PAGE_ROUTES)) {
      if (pageAccess.includes(page as PageAccess)) {
        // Check if the route matches any of the allowed routes for this page
        if (routes.some((allowedRoute) => route === allowedRoute || route.startsWith(allowedRoute + "/"))) {
          return true;
        }
      }
    }

    return false;
  };


  const filterMenuItems = (items: MenuItem[] | undefined, pageAccess: PageAccess[]): MenuItem[] => {
    if (!items) return [];

    return items
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        // Handle group type items (like "Main Menu" group)
        if ("type" in item && item.type === "group") {
          const filteredChildren = filterMenuItems(item.children as MenuItem[], pageAccess);

          // Only include the group if it has accessible children
          if (filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren,
            } as MenuItem;
          }
          return null;
        }

        // Handle regular menu items
        const route = (item as any).key as string;

        // If item has children (like Master menu), filter them recursively
        if ("children" in item && item.children) {
          const filteredChildren = filterMenuItems(item.children as MenuItem[], pageAccess);

          // Only include parent if it has accessible children
          if (filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren,
            } as MenuItem;
          }
          return null;
        }

        // For leaf items, check if the route is accessible
        if (route && isRouteAccessible(route, pageAccess)) {
          return item;
        }

        return null;
      })
      .filter((item) => item !== null) as MenuItem[];
  };


  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(mainMenu, currentPageAccess);
  }, [currentPageAccess]);

  return { menuItems: filteredMenuItems };
};

// export default () => {
//   return { menuItems: mainMenu };
// };

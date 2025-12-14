
import { useSidebar } from "@/context/SidebarContextProvider";
import { useThemeContext } from "@/context/ThemeContextProvider";
import useMenu from "@/hooks/useMenu";
import { Menu, Layout, Tooltip } from "antd";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import AppScrollbar from "../AppScrollBar";
import Link from "next/link";
import { Bell, ChevronLeft, MoonIcon, SunIcon } from "lucide-react";
import Image from "next/image";
import NotificationDrawer from "../NotificationDrawer/NotificationDrawer";
import AccountSwitcher from "../AccountSwitcher/AccountSwithcer";
import { MenuProps } from "antd/lib";
import ShinyText from "../ShinyText/ShinyText";

const { Sider } = Layout;

function Sidebar() {
  const routePath = usePathname();
  const { themeMode, setThemeMode } = useThemeContext();
  const { collapsed, setCollapsed } = useSidebar();
  const { menuItems } = useMenu();
  const [openKeys, setOpenKeys] = useState(routePath.split("/"));
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openNotification, setOpenNotification] = useState(false);

  // Memoize the link wrapper function
  const wrapLabelWithLink = useCallback((item: any) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    return {
      ...item,
      label: !hasChildren ? <Link href={item.key}>{item.label}</Link> : item.label,
      children: hasChildren
        ? item.children.map((child: any) => wrapLabelWithLink(child))
        : undefined,
    };
  }, []);

  // Memoize menu items to prevent recalculation
  const MENUITEMS = useMemo(() => menuItems.map(wrapLabelWithLink), [menuItems, wrapLabelWithLink]);

  useEffect(() => {
    if (routePath.includes("leads")) {
      setSelectedKeys(["/leads"]);
    } else if (routePath.includes("deals")) {
      setSelectedKeys(["/deals"]);
    } else if (routePath.includes("healthcares")) {
      setSelectedKeys(["/healthcares"]);
    } else if (routePath.includes("products")) {
      setSelectedKeys(["/products"]);
    } else {
      setSelectedKeys([routePath]);
    }
    if (routePath.includes('master')) {
      setOpenKeys(["/master"]);
    }
  }, [routePath]);

  // Memoize event handlers
  const handleThemeToggle = useCallback(() => {
    setThemeMode(themeMode === "light" ? "dark" : "light");
  }, [themeMode, setThemeMode]);

  const handleNotificationClose = useCallback(() => {
    setTimeout(() => {
      setOpenNotification(false);
    }, 0);
  }, []);

  const handleNotificationOpen = useCallback(() => {
    setOpenNotification(true);
  }, []);

  const handleCollapseToggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  // Memoize system menu
  const SystemMenu: MenuProps['items'] = useMemo(() => [
    {
      key: "system",
      type: "group",
      label: "System",
      children: [
        {
          key: "notifications",
          icon: <Bell size={20} />,
          label: (
            <NotificationDrawer
              open={openNotification}
              close={handleNotificationClose}
            />
          ),
          onClick: handleNotificationOpen
        },
        {
          key: 'theme',
          icon: themeMode === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />,
          label: themeMode === "light" ? "Dark Mode" : "Light Mode",
          onClick: handleThemeToggle
        },
      ],
    },
  ], [themeMode, openNotification, handleNotificationClose, handleNotificationOpen, handleThemeToggle]);

  const fullMenu = useMemo(() => [...MENUITEMS], [MENUITEMS]);

  // Memoize class names
  const siderClassName = useMemo(() =>
    `border-r ${themeMode === "light" ? "!bg-sidebar-bg !border-border-header" : "!bg-black border-dark-border"}`,
    [themeMode]
  );

  const menuClassName = useMemo(() =>
    `h-max !text-sm  !font-medium !px-1 ${themeMode === "light" ? "!bg-sidebar-bg" : "!bg-black"}`,
    [themeMode]
  );

  const systemMenuClassName = useMemo(() =>
    `!text-sm !font-vietnam !font-medium  h-max !px-1 ${themeMode === "light" ? "!bg-sidebar-bg" : "!bg-black"}`,
    [themeMode]
  );

  return (
    <Sider
      breakpoint="md"
      onBreakpoint={(broken) => setCollapsed(broken)}
      width={240}
      collapsible
      trigger={null}
      collapsed={collapsed}
      className={siderClassName}
    >
      <div className="flex items-center justify-center p-4 border-b border-b-border-header dark:border-dark-border">
        {collapsed ?
          <ShinyText text="M" speed={1} className="text-xl" />
          :
          <ShinyText text="MARKET ACCESS" speed={3} className="text-xl" />
        }
        <div
          className="absolute border-1 border-border-header  rotate-45 group group:hover:text-gray-400 top-4.5 bg-white dark:bg-black -right-[13px] cursor-pointer  p-1 rounded-full  dark:border-dark-border"
          onClick={handleCollapseToggle}
        >
          <ChevronLeft
            color="#888888"
            size={16}
            className={`transition-all  duration-300 text-gray-600  ${!collapsed ? "-rotate-45" : "rotate-135"}`}
          />
        </div>
      </div>
      <div>
        <AppScrollbar className="h-[calc(100vh-280px)]">
          <Menu
            rootClassName="!border-0"
            className={menuClassName}
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={fullMenu}
          />
        </AppScrollbar>
        <div className="absolute w-full bottom-0">
          <Menu
            rootClassName="!border-0"
            className={systemMenuClassName}
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={SystemMenu}
          />

          <AccountSwitcher />
          {!collapsed && <div className="text-center py-2">
            <div className="text-gray-500 text-xs">
              &copy;  2026 <a className="text-primary" target="_blank" href="https://topialifesciences.com">Topia Lifesciences</a>
            </div>
          </div>}
        </div>
      </div>
    </Sider>
  );
}

// Wrap component in React.memo to prevent unnecessary re-renders
export default memo(Sidebar);

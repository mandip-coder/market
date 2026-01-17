
import { useSidebar } from "@/context/SidebarContextProvider";
import { useThemeContext } from "@/context/ThemeContextProvider";
import useMenu from "@/hooks/useMenu";
import { Layout, Menu } from "antd";
import { MenuProps } from "antd/lib";
import { Bell, ChevronLeft, MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccountSwitcher from "../AccountSwitcher/AccountSwithcer";
import AppScrollbar from "../AppScrollBar";
import NotificationDrawer from "../NotificationDrawer/NotificationDrawer";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    }
    else if (routePath.includes("user-management")) {
      setSelectedKeys(["/master/user-management"]);
    }
    else {
      setSelectedKeys([routePath]);
    }
    if (routePath.includes('master')) {
      setOpenKeys(["/master"]);
    }
  }, [routePath]);

  // Auto-scroll selected item to center of sidebar
  useEffect(() => {
    if (selectedKeys.length > 0 && scrollContainerRef.current) {
      // Small delay to ensure DOM is updated after menu selection
      const timer = setTimeout(() => {
        const selectedElement = scrollContainerRef.current?.querySelector('.ant-menu-item-selected');
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [selectedKeys]);

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
        // {
        //   key: "notifications",
        //   icon: <Bell size={20} />,
        //   label: (
        //     <NotificationDrawer
        //       open={openNotification}
        //       close={handleNotificationClose}
        //     />
        //   ),
        //   onClick: handleNotificationOpen
        // },
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
      <div ref={scrollContainerRef}>
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

import { useSidebar } from "@/context/SidebarContextProvider";
import { logoutAction } from "@/lib/actions/signOut";
import { Dropdown, MenuProps } from "antd";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";

const orgs = [
  { id: 1, name: "Rocks Company", email: "ZyA9o@example.com" },
  { id: 2, name: "Skyline Inc.", email: "p7N0M@example.com" },
  { id: 3, name: "GreenTech Labs", email: "m4BwW@example.com" },
  { id: 4, name: "Nova Solutions", email: "M2p4Q@example.com" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function OrgSwitcher() {
  const [selectedOrg, setSelectedOrg] = useState(orgs[0]);
  const { collapsed } = useSidebar();
  const { update } = useSession()

  const handleLogoutClick = async () => {
    try {
      const res = await logoutAction()
      if (res.success) {
        await signOut({ redirectTo: "/auth/login" });
        toast.success("Logout successful");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const items: MenuProps["items"] = [
    ...orgs.map((org) => ({
      key: org.id,
      title: "",
      label: (
        <div
          className="flex items-center gap-3  py-2 rounded-md cursor-pointer"
          onClick={() => setSelectedOrg(org)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm">
            {getInitials(org.name)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 dark:text-gray-200">{org.name}</span>
            <span title={org.email} className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">{org.email}</span>
          </div>
        </div>
      ),
    })),
    {
      type: "group",
      key: "group",
      label: "Other",
    },
    {
      key: "profile",
      label: "Profile",
      icon: <User size={16} />
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings size={16} />
    },
    {
      type: "divider",
      key: "divider",
    },
    {
      key: "logout",
      danger: true,
      label: "Logout",
      icon: <LogOut size={16} />,
      onClick: handleLogoutClick
    },
  ];

  return (
    <Dropdown
      key={"org-switcher"}
      menu={{ items, selectedKeys: [selectedOrg.id.toString()] }}
      trigger={["click"]}
      placement="topLeft"
    >
      <button
        className="flex cursor-pointer items-center justify-between w-full border-y border-border-header dark:border-dark-border px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title=""
      >
        {collapsed ? (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm mx-auto">
            {getInitials(selectedOrg.name)}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm">
                {getInitials(selectedOrg.name)}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedOrg.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{selectedOrg.email}</span>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </>
        )}
      </button>
    </Dropdown>
  );
}
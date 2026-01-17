import { useSidebar } from "@/context/SidebarContextProvider";
import { logoutAction } from "@/lib/actions/signOut";
import { refreshTokenAction } from "@/lib/actions/refreshToken";
import { Avatar, Dropdown, MenuProps } from "antd";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { Company } from "@/types/authorization";


function getInitials(name: string) {
  try {

    return name
      .split(" ").slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  } catch (e) {
    return ""
  }
}


export default function OrgSwitcher() {
  const { data: Session } = useSession()
  const orgs = Session?.user?.companies || []
  const [selectedOrg, setSelectedOrg] = useState<Company | undefined>(orgs[0]);
  const [switching, setSwitching] = useState(false);
  const { collapsed } = useSidebar();
  const { update } = useSession()

  useEffect(() => {
    if (orgs.length > 0 && !selectedOrg) {
      setSelectedOrg(orgs[0]);
    }
  }, [orgs, selectedOrg]);

  const handleOrgSwitch = async (org: Company) => {
    setSwitching(true);
    try {
      // Refresh token with new company context
      const refreshResult = await refreshTokenAction(org.companyUUID);
      
      if (!refreshResult.success) {
        setSwitching(false);
        toast.error(refreshResult.error || "Failed to refresh token");
        return;
      }

      // Update session with new token and company
      await update({
        ...Session,
        user: {
          ...Session?.user,
          selectedCompany: org,
          token: refreshResult.refreshToken,
          accessTokenExpires: refreshResult.accessTokenExpires,
        },
        accessToken: refreshResult.refreshToken,
        accessTokenExpires: refreshResult.accessTokenExpires,
      });
      
      setSelectedOrg(org);
      toast.success(`Switched to ${org.displayName}`);
    } catch (error) {
      toast.error("Failed to switch organization");
      console.error("Organization switch error:", error);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogoutClick = async () => {
    const res = await logoutAction()
    if (res.success) {
      toast.success("Logout successful");
      return
    }
    toast.error("Logout failed");
  };

  // Return null if no organizations available
  if (!orgs || orgs.length === 0) {
    return null;
  }

  const items: MenuProps["items"] = [
    // ...orgs.map((org) => {
    //   const isSelected = selectedOrg?.companyUUID === org.companyUUID;
    //   return {
    //     key: org.companyUUID,
    //     title: "",
    //     disabled: isSelected || switching,
    //     label: (
    //       <div
    //         className={`flex items-center gap-3 py-2 rounded-md ${isSelected || switching ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
    //           }`}
    //         onClick={() => !isSelected && !switching && handleOrgSwitch(org)}
    //       >
    //         <Avatar size={40} src={org?.imagePath} />
    //         <div className="flex flex-col">
    //           <span className="font-medium text-gray-800 dark:text-gray-200">{org?.displayName}</span>
    //           <span title={org?.email} className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">{org?.email}</span>
    //         </div>
    //       </div>
    //     ),
    //   };
    // }),
    // {
    //   type: "group",
    //   key: "group",
    //   label: "Other",
    // },
    // {
    //   key: "profile",
    //   label: "Profile",
    //   icon: <User size={16} />
    // },
    // {
    //   key: "settings",
    //   label: "Settings",
    //   icon: <Settings size={16} />
    // },
    // {
    //   type: "divider",
    //   key: "divider",
    // },
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
      menu={{ items, selectedKeys: [selectedOrg?.companyUUID || ""] }}
      trigger={["click"]}
      placement="topLeft"
    >
      <button
        className="flex cursor-pointer items-center justify-between w-full border-y border-border-header dark:border-dark-border px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"

      >
        {collapsed ? (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm mx-auto">
            {getInitials(selectedOrg?.displayName || "")}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
             <Avatar size={40} src={selectedOrg?.imagePath} />
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedOrg?.displayName}</span>
                <span className="truncate max-w-[150px] block text-xs text-gray-500 dark:text-gray-400">{selectedOrg?.email}</span>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </>
        )}
      </button>
    </Dropdown>
  );
}

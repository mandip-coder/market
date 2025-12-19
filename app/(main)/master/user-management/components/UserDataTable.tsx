"use client";
import useColumnSearch from "@/hooks/useColumnSearch";
import { useLoading } from "@/hooks/useLoading";
import { useTableScroll } from "@/hooks/useTableScroll";
import {
  EditOutlined,
  FlagOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
  UserOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import type { MenuProps } from "antd";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Input,
  Modal,
  Popover,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Edit,
  Eye,
  LockIcon,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Trash,
} from "lucide-react";
import React, {
  memo,
  Suspense,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { EditableAccessCell } from "./EditableAccessCell";
import { LockUserModal } from "./LockUserModal";
import { StatusSwitch } from "./StatusSwitch";
import { ExtraThings } from "./TableExtraThings";
import { useUsersStore } from "@/context/store/usersStore";
import { UserInfo } from "./UserInfo";
import { Company } from "../../company-master/components/CompanyDataTable";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import Paragraph from "antd/es/typography/Paragraph";
import { useApi } from "@/hooks/useAPI";
import { APIPATH } from "@/shared/constants/url";
import { GlobalDate } from "@/Utils/helpers";
import { Role } from "../../roles-master/components/RoleDataTable";

dayjs.extend(relativeTime);

export interface Country {
  countryUUID: string;
  countryName: string;
  countryCode: string;
}

export interface User {
  userUUID: string;
  fullName: string;
  empCode: string;
  firstName: string;
  lastName: string;
  loginUsername: string;
  email: string;
  phone1: string;
  phone1HasWhatsapp?: boolean;
  phone2: string;
  phone2HasWhatsapp?: boolean;
  phone3: string;
  phone3HasWhatsapp?: boolean;
  createdAt: string;
  lastLogIn: string;
  status: "active" | "inactive" | "locked" | "deleted";
  companies: CompanyAccess[];
  lockUntil?: string;
  initial: string;
  officePhone: string;
  password: string;
  countryAccess: Country[];
  companyAccess: Company[];
  profileImage: File | null;
  profileImageUrl: string | null;
  multiFactorLogin: boolean;
  loginUserName: string;
}


export interface UsersDataResponse {
  data: {
    users: User[];
    total: number;
    limit: number;
    page: number;
  };
}

interface PaginationParams {
  current?: number;
  pageSize?: number;
  total?: number;
}

interface FetchParams {
  pagination?: PaginationParams;
  sorter?: any;
  filters?: any;
}

export interface CompanyAccess {
  company: {
    companyUUID: string;
    displayName: string;
  };
  roles: Role[];
}

export interface CompanyListResponse {
  data: {
    companies: Company[];
    total: number;
  };
}

interface CountryListResponse {
  data: {
    countries: Country[];
  };
}

interface UserDataTableProps {
  usersData: Promise<UsersDataResponse>;
  companyList: Promise<CompanyListResponse>;
  countryList: Promise<CountryListResponse>;
}

function UserDataTable({
  usersData,
  companyList,
  countryList,
}: UserDataTableProps) {
  const usersDataAPI = use(usersData);
  const fullData = usersDataAPI.data;
  const API = useApi();
  const { tableDataState, setTableDataState, setLockModal } = useUsersStore();
  useEffect(() => {
    setTableDataState(fullData.users);
  }, [fullData]);
  const [selectedUsers, setSelectedUsers] = useState<React.Key[]>([]);
  const { toggleAddUserDrawer, setEditUser } = useUsersStore();
  const getSearchProps = useColumnSearch();
  const [pagination, setPagination] = useState<PaginationParams>({
    current: fullData.page || 1,
    pageSize: fullData.limit,
    total: fullData.total,
  });
  const [loading, setLoading] = useLoading();
  const { scrollY, tableWrapperRef } = useTableScroll();
  const [modal, contextHolder] = Modal.useModal();

  // State for modals
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [companyAccess, setCompanyAccess] = useState<CompanyAccess[]>([]);

  // State for lock user modal

  const [userToLock, setUserToLock] = useState<User | null>(null);
  const [isEditingLock, setIsEditingLock] = useState(false);

  // Mock data for companies, roles, and products

  // Get current roles and access of selected users
  const selectedUsersData = useMemo(() => {
    return tableDataState.filter((user) =>
      selectedUsers.includes(user.userUUID)
    );
  }, [tableDataState, selectedUsers]);

  // Get common roles among selected users
  const currentRoles = useMemo(() => {
    if (selectedUsers.length === 0) return [];

    const rolesCount: { [key: string]: number } = {};
    selectedUsersData.forEach((user) => {
      user.companies.forEach((company) => {
        company.roles.forEach((role) => {
          rolesCount[role.roleUUID] = (rolesCount[role.roleUUID] || 0) + 1;
        });
      });
    });

    return Object.keys(rolesCount).filter(
      (role) => rolesCount[role] === selectedUsers.length
    );
  }, [selectedUsers, selectedUsersData]);

  // Get common company access among selected users
  const currentCompanyAccess = useMemo(() => {
    if (selectedUsers.length === 0) return [];

    // Find common company access across all selected users
    const commonAccess: CompanyAccess[] = [];

    // Start with the first user's access
    if (selectedUsersData.length > 0) {
      const firstUserAccess = selectedUsersData[0].companies;

      // For each company in the first user's access, check if it exists in all other users
      firstUserAccess.forEach((companyAccess) => {
        const isCommon = selectedUsersData.every((user) =>
          user.companies.some(
            (access) =>
              access.company.companyUUID === companyAccess.company.companyUUID
          )
        );

        if (isCommon) {
          // Get the common roles and products for this company
          const commonRoles = companyAccess.roles.filter((role) =>
            selectedUsersData.every((user) =>
              user.companies
                .find(
                  (access) =>
                    access.company.companyUUID ===
                    companyAccess.company.companyUUID
                )
                ?.roles.includes(role)
            )
          );

          commonAccess.push({
            company: companyAccess.company,
            roles: commonRoles,
          });
        }
      });
    }

    return commonAccess;
  }, [selectedUsers, selectedUsersData]);

  // Helper function to clear selection after operation
  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);
  const handleEdit = useCallback((user: User) => {
    setEditUser(user as any);
    toggleAddUserDrawer();
  }, []);

  // Memoize action menus to prevent unnecessary re-renders
  const actionMenus = useCallback(
    (record: User): MenuProps["items"] => {
      const baseItems: MenuProps["items"] = [
        {
          key: "edit",
          label: "Edit",
          icon: <Edit size={14} />,
          onClick: () => {
            handleEdit(record);
          },
        },
        {
          type: "divider",
        },
        {
          ...(record.status !== "locked"
            ? {
                key: "lock",
                label: "Lock",
                icon: <LockIcon size={14} />,
                onClick: () => {
                  setUserToLock(record);
                  setIsEditingLock(false);
                  setLockModal(true);
                },
              }
            : {
                key: "unlock",
                label: "Unlock",
                icon: <UnlockOutlined />,
                onClick: () => {
                  handleUnlockUser(record.userUUID);
                },
              }),
        },
        // Add edit lock option for locked users
        ...(record.status === "locked"
          ? [
              {
                key: "edit-lock",
                label: "Edit Lock",
                icon: <EditOutlined />,
                onClick: () => {
                  setUserToLock(record);
                  setIsEditingLock(true);
                },
              },
            ]
          : []),
        {
          type: "divider",
        },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash size={14} />,
          danger: true,
          onClick: () => {
            modal.confirm({
              title: "Delete User",
              content: (
                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {record.initial}.{record.fullName}
                  </strong>
                  ? This action cannot be undone.
                </p>
              ),
              okText: "Delete",
              okType: "danger",
              cancelText: "Cancel",
              maskClosable: true,
              onOk: async () => {
                  const response = await API.delete(
                    `${APIPATH.USERS.DELETEUSER}/${record.userUUID}`
                  );
                  if (response) {
                    toast.success(
                      `User ${record.loginUsername} deleted successfully`
                    );
                    setTableDataState((prevData) =>
                      prevData.filter(
                        (user) => user.userUUID !== record.userUUID
                      )
                    );
                  }else{
                    throw new Error("Failed to delete user");
                  } 
              },
            });
          },
        },
      ];

      return baseItems;
    },
    [modal]
  );

  // Handle bulk actions
  const handleBulkAction = useCallback(
    (action: string) => {
      switch (action) {
        case "export":
          toast.info("Exporting users...");
          break;
        case "assign-access":
          setAccessModalVisible(true);
          setCompanyAccess(currentCompanyAccess);
          break;
        case "lock":
          // For bulk lock, we'll use a simple lock without the modal for now
          // You could extend this to show a modal for bulk lock as well
          modal.confirm({
            title: `Lock ${selectedUsers.length} User${
              selectedUsers.length > 1 ? "s" : ""
            }`,
            content: `Are you sure you want to lock ${
              selectedUsers.length
            } user${
              selectedUsers.length > 1 ? "s" : ""
            }? They will not be able to access their accounts.`,
            okText: "Lock",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => {
              // Handle bulk lock
              setTableDataState((prevData) =>
                prevData.map((user) =>
                  selectedUsers.includes(user.userUUID)
                    ? { ...user, status: "locked" }
                    : user
                )
              );
              toast.success(
                `${selectedUsers.length} user${
                  selectedUsers.length > 1 ? "s" : ""
                } locked successfully`
              );
              clearSelection(); // Clear selection after operation
            },
          });
          break;
        case "delete":
          modal.confirm({
            title: `Delete ${selectedUsers.length} User${
              selectedUsers.length > 1 ? "s" : ""
            }`,
            content: (
              <div>
                <p>
                  Are you sure you want to delete {selectedUsers.length} user
                  {selectedUsers.length > 1 ? "s" : ""}?
                </p>
                <p className="text-red-500 mt-2">
                  This action cannot be undone and will permanently remove their
                  data.
                </p>
                <div className="mt-2">
                  <p className="font-semibold">Users to be deleted:</p>
                  <ul className="list-disc list-inside mt-1">
                    {selectedUsersData.map((user) => (
                      <li key={user.userUUID}>
                        {user.loginUsername} ({user.email})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ),
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            okButtonProps: { type: "primary" },
            width: 700,
            onOk: () => {
              setTableDataState((prevData) =>
                prevData.filter(
                  (user) => !selectedUsers.includes(user.userUUID)
                )
              );
              toast.success(
                `${selectedUsers.length} user${
                  selectedUsers.length > 1 ? "s" : ""
                } deleted successfully`
              );
              clearSelection(); // Clear selection after operation
            },
          });
          break;
        default:
          break;
      }
    },
    [
      selectedUsers,
      modal,
      selectedUsersData,
      clearSelection,
      currentCompanyAccess,
    ]
  );

  // Handle bulk role assignment
  const handleBulkRoleAssignment = useCallback(
    (roles: string[]) => {
      setTableDataState((prevData) =>
        prevData.map((user) =>
          selectedUsers.includes(user.userUUID) ? { ...user, roles } : user
        )
      );

      toast.success(
        `Roles updated for ${selectedUsers.length} user${
          selectedUsers.length > 1 ? "s" : ""
        }`
      );
      clearSelection(); // Clear selection after operation
    },
    [selectedUsers, clearSelection]
  );

  // Handle bulk access assignment
  const handleBulkAccessAssignment = useCallback(
    (access: CompanyAccess[]) => {
      setTableDataState((prevData) =>
        prevData.map((user) =>
          selectedUsers.includes(user.userUUID) ? { ...user, access } : user
        )
      );

      toast.success(
        `Access updated for ${selectedUsers.length} user${
          selectedUsers.length > 1 ? "s" : ""
        }`
      );
      clearSelection(); // Clear selection after operation
      setAccessModalVisible(false);
    },
    [selectedUsers, clearSelection]
  );

  // Handle user status update

  // Handle user roles update
  const handleUserRolesUpdate = useCallback(
    (userUUID: string, newRoles: string[]) => {
      setTableDataState((prevData) =>
        prevData.map((user) =>
          user.userUUID === userUUID ? { ...user, roles: newRoles } : user
        )
      );
    },
    []
  );

  // Handle user access update

  const handleUserStatusUpdate = useCallback(
    (userUUID: string, newStatus: User["status"], lockUntil?: string) => {
      setTableDataState((prevData) =>
        prevData.map((user) =>
          user.userUUID === userUUID
            ? { ...user, status: newStatus, lockUntil }
            : user
        )
      );
    },
    []
  );

  // Handle unlock user with confirmation
  const handleUnlockUser = useCallback(
    (userUUID: string) => {
      modal.confirm({
        title: "Unlock User",
        content:
          "Are you sure you want to unlock this user? They will be able to access their account again.",
        okText: "Unlock",
        cancelText: "Cancel",
        onOk: () => {
          handleUserStatusUpdate(userUUID, "active");
        },
      });
    },
    [modal, setLoading]
  );
  const getPhoneNumberRender = useCallback((record: User) => {
    if (!record.phone1) {
      return (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <PhoneOutlined className="text-base" />
          <span className="italic">No phone number</span>
        </div>
      );
    }

    const phones: { value: string; hasWhatsapp?: boolean }[] = [];

    if (record.phone1) {
      phones.push({
        value: record.phone1,
        hasWhatsapp: record.phone1HasWhatsapp,
      });
    }
    if (record.phone2) {
      phones.push({
        value: record.phone2,
        hasWhatsapp: record.phone2HasWhatsapp,
      });
    }
    if (record.phone3) {
      phones.push({
        value: record.phone3,
        hasWhatsapp: record.phone3HasWhatsapp,
      });
    }

    const primary = phones[0];
    const extraPhones = phones.slice(1);
    const extraCount = extraPhones.length;

    const popoverContent = extraCount ? (
      <Space orientation="vertical" size="small" className="min-w-[180px]">
        {extraPhones.map((phone, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <Paragraph
              className="!m-0"
              copyable={{
                tooltips: ["Copy Phone", "Copied!"],
                text: phone.value,
              }}
            >
              <a
                href={`tel:${phone.value}`}
                className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
              >
                {phone.value}
              </a>
            </Paragraph>

            {phone.hasWhatsapp && (
              <Tooltip title="Chat on WhatsApp">
                <Button
                  type="link"
                  size="small"
                  href={`https://wa.me/${phone.value.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!text-green-600 hover:!text-green-700"
                >
                  <WhatsAppOutlined />
                </Button>
              </Tooltip>
            )}
          </div>
        ))}
      </Space>
    ) : null;

    return (
      <Card size="small" className=" w-full">
        <div className="flex items-center justify-between gap-2">
          {/* Primary number (sirf ye hi direct dikhega) */}
          <Paragraph
            className="!m-0 !p-0 flex-1"
            copyable={{
              tooltips: ["Copy Phone", "Copied!"],
              text: primary.value,
            }}
          >
            <a
              href={`tel:${primary.value}`}
              className="flex-1 text-gray-700 font-medium hover:text-blue-600 transition-colors"
            >
              {primary.value}
            </a>
          </Paragraph>

          <div className="flex items-center gap-1">
            {/* Primary ke liye WhatsApp */}
            {primary.hasWhatsapp && (
              <Tooltip title="Chat on WhatsApp">
                <Button
                  type="link"
                  size="small"
                  href={`https://wa.me/${primary.value.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!text-green-600 hover:!text-green-700"
                >
                  <WhatsAppOutlined />
                </Button>
              </Tooltip>
            )}

            {/* Extra numbers ka +N Popover trigger */}
            {extraCount > 0 && (
              <Popover
                content={popoverContent}
                title="Alternate Phones"
                trigger="click" // chahe to "hover" bhi kar sakta hai
              >
                <Button type="link" size="small" className="!px-1">
                  <Badge count={"+" + extraCount} color="green" />
                </Button>
              </Popover>
            )}
          </div>
        </div>
      </Card>
    );
  }, []);

  const fetchData = useCallback(
    async (params: FetchParams & { status?: string[] }) => {
      setLoading(true);
        const response = (await API.get(
          `${APIPATH.USERS.GETUSERS}`
        )) as UsersDataResponse;
        if(response){
          setTableDataState(response.data.users);
          setPagination({
            ...params.pagination,
            total: tableDataState.length,
          });
        }
        setLoading(false);
    },
    [setLoading, setTableDataState, setPagination, tableDataState]
  );

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "Name",
        fixed: "left",
        width: 300,
        key: "loginUsername",
        render: (record: User) => (
          <UserInfo
            fullName={record.fullName}
            empCode={record.empCode}
            userName={record.loginUsername}
            initial={record.initial}
          />
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 200,
        sorter: true,
      },
      {
        title: "Phone",
        key: "phone",
        width: 230,
        render: (record: User) => getPhoneNumberRender(record),
      },
      {
        title: "Country Access",
        key: "countryAccess",
        dataIndex: "countryAccess",
        width: 150,
        sorter: true,
        render: (countryAccess: User["countryAccess"]) => {
          if (!countryAccess || !Array.isArray(countryAccess)) return null;

          return (
            <div className="flex items-center flex-wrap gap-2">
              {countryAccess.map((c) => {
                return (
                  <Tag variant="outlined" key={`${c.countryUUID}`}>
                    {c.countryName}
                  </Tag>
                );
              })}
            </div>
          );
        },
      },
      {
        title: "Company Access",
        dataIndex: "companies",
        key: "companies",
        width: 240,
        render: (companies: CompanyAccess[], record: User) => (
          <SuspenseWithBoundary
            key={`${record.userUUID}`}
            loading={<Skeleton active paragraph={{ rows: 1 }} />}
          >
            <EditableAccessCell
              access={companies}
              user={record}
              companiesData={companyList}
            />
          </SuspenseWithBoundary>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        filters: [
          { text: "Active", value: "active" },
          { text: "Inactive", value: "inactive" },
          { text: "Locked", value: "locked" },
        ],
        render: (status: string, record: User) => (
          <div key={`status-${record.userUUID}`}>
            <StatusSwitch
              status={status}
              userUUID={record.userUUID}
              onUnlock={handleUnlockUser}
            />
            {status === "locked" && record.lockUntil && (
              <div className="text-xs text-gray-500 mt-1">
                {record.lockUntil
                  ? `Locked until ${dayjs(record.lockUntil).format(
                      "MMM DD, YYYY"
                    )}`
                  : "Permanently locked"}
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Last Login",
        width: 180,
        key: "lastLogIn",
        render: ({ lastLogIn, userUUID }: User) => {
          return (
            <div key={`last-login-${userUUID}`}>
              {lastLogIn ? (
                <div>
                  <div className="mb-1">
                    {GlobalDate(lastLogIn) +
                      ", " +
                      dayjs(lastLogIn).format("hh:mm A")}
                  </div>
                  <Tag variant="outlined">
                    {dayjs().diff(dayjs(lastLogIn), "day") < 30
                      ? `${dayjs().diff(dayjs(lastLogIn), "day")} days ago`
                      : dayjs(lastLogIn).fromNow()}
                  </Tag>
                </div>
              ) : (
                <p className="text-center">-</p>
              )}
            </div>
          );
        },
      },
    ];

    return [
      ...baseColumns.map((item) => ({
        align: "left" as const,
        ...item,
      })),
      {
        title: "Action",
        key: "action",
        fixed: "right",
        width: 70,
        render: (record: User) => (
          <Dropdown
            key={`action-${record.userUUID}`}
            placement="bottomRight"
            trigger={["click"]}
            menu={{
              items: actionMenus(record),
            }}
          >
            <Button size="small" type="text" icon={<MoreHorizontal />} />
          </Dropdown>
        ),
      },
    ];
  }, [getSearchProps, actionMenus, handleUserRolesUpdate, handleUnlockUser]);

  return (
    <>
      {contextHolder}
      <div ref={tableWrapperRef}>
        <ProTable<User>
          columns={columns as any}
          bordered
          defaultSize="small"
          locale={{
            triggerDesc: "Sort descending",
            triggerAsc: "Sort ascending",
            cancelSort: "Clear sorting",
            emptyText: (
              <div className="py-10 text-center text-gray-500">
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">
                  Try adjusting your filters or search query.
                </p>
              </div>
            ),
          }}
          dataSource={tableDataState}
          request={async (params, sorter, filter) => {
            const apiParams: FetchParams = {
              pagination: { ...params },
              sorter,
              filters: filter,
            };

            await fetchData(apiParams);
            return {
              data: tableDataState,
              total: pagination.total,
              success: true,
            };
          }}
          manualRequest
          className="pro-table-customize"
          // rowSelection={{
          //   type: "checkbox",
          //   selectedRowKeys: selectedUsers,
          //   onChange: (selectedRowKeys) => {
          //     setSelectedUsers(selectedRowKeys);
          //   },
          // }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          options={{
            fullScreen: true,
            reloadIcon: <ReloadOutlined spin={loading} />,
          }}
          toolbar={{
            actions: [
              // Remove the Fragment and add a key to the ExtraThings component
              <ExtraThings
                key="extra-things"
                selectedUsers={selectedUsers}
                onBulkAction={handleBulkAction}
              />,
            ],
          }}
          search={false}
          headerTitle={
            <Input
              placeholder="Search users with name or email"
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          }
          pagination={{
            ...pagination,
            size: "small",
            pageSizeOptions: [5, 10, 20, 50, 100],
            showQuickJumper: true,
            showSizeChanger: true,
          }}
          scroll={{ x: 1200, y: scrollY }}
          sticky
          loading={loading}
          rowKey="userUUID"
        />
      </div>

      {/* Lock User Modal - Updated to handle both new locks and editing existing locks */}
      <LockUserModal
        onCancel={() => {
          setUserToLock(null);
          setIsEditingLock(false);
          setLockModal(false);
        }}
        lockedUser={userToLock as User}
        isEditing={isEditingLock}
        currentLockUntil={userToLock?.lockUntil}
      />
    </>
  );
}

export default memo(UserDataTable);

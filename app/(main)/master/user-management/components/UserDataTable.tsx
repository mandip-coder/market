"use client";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import { useUsersStore } from "@/context/store/usersStore";
import useColumnSearch from "@/hooks/useColumnSearch";
import { useLoading } from "@/hooks/useLoading";
import { useTableScroll } from "@/hooks/useTableScroll";
import { GlobalDate } from "@/Utils/helpers";
import {
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
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
} from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Edit, MoreHorizontal, RefreshCw, Trash } from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { useFetchUsers, useDeleteUser } from "../services/user.hooks";
import { CompanyAccess, FetchUsersParams, User } from "../services/user.types";
import { EditableAccessCell } from "./EditableAccessCell";
import { LockUserModal } from "./LockUserModal";
import { StatusSwitch } from "./StatusSwitch";
import { UserInfo } from "./UserInfo";
import { useCompanies } from "@/services/dropdowns/dropdowns.hooks";

dayjs.extend(relativeTime);

function UserDataTable() {
  // Pagination and filter state
  const [fetchParams, setFetchParams] = useState<FetchUsersParams>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data: companyList = [], isLoading: companiesLoading,refetch:refetchCompanies } =
    useCompanies();
    const {
      data: usersResponse,
      isLoading: usersLoading,
      refetch,
      isFetching,
    } = useFetchUsers(fetchParams);
    const deleteUserMutation = useDeleteUser();
    const fetchAll = () => {
      refetch();
      refetchCompanies();
    };

  const usersData = usersResponse?.data?.users || [];
  const totalRecords = usersResponse?.data?.total || 0;

  const { setLockModal } = useUsersStore();
  const [selectedUsers, setSelectedUsers] = useState<React.Key[]>([]);
  const { toggleAddUserDrawer, setEditUser } = useUsersStore();
  const getSearchProps = useColumnSearch();
  const [loading, setLoading] = useLoading();
  const { scrollY, tableWrapperRef } = useTableScroll();
  const [modal, contextHolder] = Modal.useModal();

  // State for modals
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [companyAccess, setCompanyAccess] = useState<CompanyAccess[]>([]);

  // State for lock user modal

  const [userToLock, setUserToLock] = useState<User | null>(null);
  const [isEditingLock, setIsEditingLock] = useState(false);

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
        // {
        //   ...(record.status !== "locked"
        //     ? {
        //         key: "lock",
        //         label: "Lock",
        //         icon: <LockIcon size={14} />,
        //         onClick: () => {
        //           setUserToLock(record);
        //           setIsEditingLock(false);
        //           setLockModal(true);
        //         },
        //       }
        //     : {
        //         key: "unlock",
        //         label: "Unlock",
        //         icon: <UnlockOutlined />,
        //         onClick: () => {
        //           handleUnlockUser(record.userUUID);
        //         },
        //       }),
        // },
        // // Add edit lock option for locked users
        // ...(record.status === "locked"
        //   ? [
        //       {
        //         key: "edit-lock",
        //         label: "Edit Lock",
        //         icon: <EditOutlined />,
        //         onClick: () => {
        //           setUserToLock(record);
        //           setIsEditingLock(true);
        //         },
        //       },
        //     ]
        //   : []),
        // {
        //   type: "divider",
        // },
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
                await deleteUserMutation.mutateAsync(record.userUUID);
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
                  <ul className="list-disc list-inside mt-1"></ul>
                </div>
              </div>
            ),
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            okButtonProps: { type: "primary" },
            width: 700,
            onOk: () => {
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
    [selectedUsers, modal, clearSelection]
  );

  // Handle user status update

  // Handle user roles update

  // Handle user access update

  const handleUserStatusUpdate = useCallback(
    (userUUID: string, newStatus: User["status"], lockUntil?: string) => {},
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

  // Handle table changes (pagination, filters, sorting)
  const handleTableChange = useCallback(
    (pagination: any, filters: any, sorter: any) => {
      const newParams: FetchUsersParams = {
        page: pagination.current - 1 || 0,
        limit: pagination.pageSize || 10,
      };

      // Add sorting
      if (sorter.field) {
        newParams.sortField = sorter.field;
        newParams.sortOrder = sorter.order;
      }

      // Add status filter
      if (filters.status && filters.status.length > 0) {
        newParams.status = filters.status;
      }

      // Add search
      if (searchTerm) {
        newParams.search = searchTerm;
      }

      setFetchParams(newParams);
    },
    [searchTerm]
  );

  // Handle search with debounce
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setFetchParams((prev) => ({
      ...prev,
      search: value || undefined,
      page: 0, // Reset to first page on search
    }));
  }, []);

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
            profileImage={record.profileImageUrl}
          />
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 250,
        sorter: true,
        render: (email: string) => {
          if (!email) {
            return (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                <span className="italic">No email</span>
              </div>
            );
          }

          return (
            <Card size="small" className="w-full">
              <Paragraph
                className="!m-0 !p-0"
                copyable={{
                  tooltips: ["Copy Email", "Copied!"],
                  text: email,
                }}
              >
                <a
                  href={`mailto:${email}`}
                  className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
                >
                  {email}
                </a>
              </Paragraph>
            </Card>
          );
        },
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
              {countryAccess
                .filter((c) => c.countryUUID)
                .map((c) => {
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
          <>
            {companiesLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <EditableAccessCell
                access={companies}
                user={record}
                companyList={companyList}
              />
            )}
          </>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        // filters: [
        //   { text: "Active", value: "active" },
        //   { text: "Inactive", value: "inactive" },
        // ],
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
  }, [getSearchProps, actionMenus, handleUnlockUser,companiesLoading]);
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
          dataSource={usersData}
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
            reloadIcon: (
              <RefreshCw
                className={`${loading || isFetching ? "animate-spin" : ""}`}
                size={18}
              />
            ),
            reload: () => fetchAll(),
          }}
          // toolbar={{
          //   actions: [
          //     <ExtraThings
          //       key="extra-things"
          //       selectedUsers={[]}
          //       onBulkAction={handleBulkAction}
          //     />,
          //   ],
          // }}
          search={false}
          headerTitle={
            <Input
              placeholder="Search users with name or email"
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchTerm}
            />
          }
          pagination={{
            current: (fetchParams.page || 0) + 1,
            pageSize: fetchParams.limit || 10,
            total: totalRecords,
            size: "small",
            pageSizeOptions: [5, 10, 20, 50, 100],
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200, y: scrollY }}
          sticky
          loading={usersLoading || isFetching}
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

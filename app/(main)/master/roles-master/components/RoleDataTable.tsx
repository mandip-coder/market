"use client";
import { useRoleStore } from "@/context/store/rolesStore";

import { useTableScroll } from "@/hooks/useTableScroll";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import type { MenuProps, TableProps } from "antd";
import { Button, Dropdown, Input, Modal, Switch, Tag, Tooltip } from "antd";
import { Edit, MoreHorizontal, RefreshCw, Trash } from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { ExtraThings } from "./RolesExtraThings";
import { Role } from "../services/roles.types";
import {
  useDeleteMultipleRoles,
  useDeleteRole,
  useRoles,
  useUpdateRoleStatus,
} from "../services/roles.hooks";

type SortOrder = "ascend" | "descend" | null;

interface SorterConfig {
  field?: string;
  order?: SortOrder;
}

function RolesDataTable() {
  const { toggleRolesDrawer, setEditRole } = useRoleStore();

  const {
    data: rolesData,
    isLoading: rolesLoading,
    refetch,
    isFetching,
  } = useRoles();
  const { mutate: deleteRole } = useDeleteRole();
  const { mutate: deleteMultipleRoles } = useDeleteMultipleRoles();
  const { mutate: updateRoleStatus } = useUpdateRoleStatus();

  const [selectedRoles, setSelectedRoles] = useState<React.Key[]>([]);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State for sorting and filtering
  const [sorterConfig, setSorterConfig] = useState<SorterConfig>({});
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const { scrollY, tableWrapperRef } = useTableScroll();
  const [modal, contextHolder] = Modal.useModal();

  const handleEdit = useCallback(
    (role: Role) => {
      setEditRole(role);
      toggleRolesDrawer();
    },
    [setEditRole, toggleRolesDrawer]
  );

  // Filter, sort and search data on client side
  const processedData = useMemo(() => {
    let data = rolesData || [];

    // 1. Apply search filter
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      data = data.filter(
        (role: Role) =>
          role.roleName.toLowerCase().includes(lowercasedSearchTerm) ||
          role.description.toLowerCase().includes(lowercasedSearchTerm) ||
          role.roleCode.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // 2. Apply status filter
    if (statusFilter.length > 0) {
      data = data.filter((role: Role) => statusFilter.includes(role.status));
    }

    // 3. Apply sorting
    if (sorterConfig.field && sorterConfig.order) {
      data = [...data].sort((a: Role, b: Role) => {
        const field = sorterConfig.field as keyof Role;
        let aValue = a[field];
        let bValue = b[field];

        // Handle different data types
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sorterConfig.order === "ascend" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sorterConfig.order === "ascend" ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [rolesData, searchTerm, statusFilter, sorterConfig]);

  const clearSelection = useCallback(() => {
    setSelectedRoles([]);
  }, []);

  // Memoize action menus to prevent unnecessary re-renders
  const actionMenus = useCallback(
    (record: Role): MenuProps["items"] => {
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
          key: "delete",
          label: "Delete",
          icon: <Trash size={14} />,
          danger: true,
          onClick: () => {
            modal.confirm({
              title: "Delete Role",
              content: (
                <span>
                  Are you sure you want to delete{" "}
                  <strong>{record.roleName}</strong>? This action cannot be
                  undone.
                </span>
              ),
              okText: "Delete",
              okType: "danger",
              cancelText: "Cancel",
              maskClosable: false,
              onOk: async () => {
                deleteRole(record.roleUUID);
              },
            });
          },
        },
      ];

      return baseItems;
    },
    [modal, handleEdit, deleteRole]
  );

  const selectedRolesData = useMemo(() => {
    return processedData.filter((r: Role) =>
      selectedRoles.includes(r.roleUUID)
    );
  }, [processedData, selectedRoles]);

  const handleBulkAction = useCallback(
    (action: string) => {
      switch (action) {
        case "export":
          toast.info("Exporting...");
          break;

        case "delete":
          modal.confirm({
            title: `Delete ${selectedRoles.length} Role${
              selectedRoles.length > 1 ? "s" : ""
            }`,
            content: (
              <div>
                <p>
                  Are you sure you want to delete {selectedRoles.length} role
                  {selectedRoles.length > 1 ? "s" : ""}?
                </p>
                <p className="text-red-500 mt-2">
                  This action cannot be undone and will permanently remove data.
                </p>
                <div className="mt-2">
                  <p className="font-semibold">Roles to be deleted:</p>
                  <ul className="list-disc list-inside mt-1">
                    {selectedRolesData.map((role) => (
                      <li key={role.roleUUID}>{role.roleName}</li>
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
            onOk: async () => {
              deleteMultipleRoles(selectedRoles, {
                onSuccess: () => {
                  clearSelection();
                },
              });
            },
          });
          break;
        default:
          break;
      }
    },
    [
      selectedRoles,
      modal,
      selectedRolesData,
      clearSelection,
      deleteMultipleRoles,
    ]
  );

  const updateStatus = useCallback(
    (newStatus: Role["status"], roleUUID: Role["roleUUID"]) => {
      setStatusLoading(roleUUID);
      updateRoleStatus(
        { roleUUID, status: newStatus },
        {
          onSettled: () => setStatusLoading(null),
        }
      );
    },
    [updateRoleStatus]
  );

  const handleSearchRole = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "Role Name",
        dataIndex: "roleName",
        key: "roleUUID",
        fixed: "left" as const,
        width: 200,
        minWidth: 200,
        sorter: (a: Role, b: Role) => a.roleName.localeCompare(b.roleName),
        sortOrder:
          sorterConfig.field === "roleName" ? sorterConfig.order : null,
        render: (text: string) => (
          <Tooltip title={text}>
            <span className="font-semibold">{text}</span>
          </Tooltip>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        width: 300,
        minWidth: 450,
        sorter: (a: Role, b: Role) =>
          a.description.localeCompare(b.description),
        sortOrder:
          sorterConfig.field === "description" ? sorterConfig.order : null,
      },
      {
        title: "Role Code",
        dataIndex: "roleCode",
        key: "roleCode",
        width: 150,
        minWidth: 150,
        sorter: (a: Role, b: Role) => a.roleCode.localeCompare(b.roleCode),
        sortOrder:
          sorterConfig.field === "roleCode" ? sorterConfig.order : null,
      },
      {
        title: "Is System Role",
        dataIndex: "isSystemRole",
        key: "isSystemRole",
        width: 150,
        minWidth: 150,
        render: (isSystemRole: Role["isSystemRole"]) => (
          <Tag color={isSystemRole ? "green" : "red"}>
            {isSystemRole ? "Yes" : "No"}
          </Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        minWidth: 150,
        filters: [
          { text: "Active", value: "active" },
          { text: "Inactive", value: "inactive" },
        ],
        filteredValue: statusFilter,
        onFilter: (value: string | number | boolean, record: Role) =>
          record.status === value,
        render: (status: Role["status"], record: Role) => (
          <div key={`status-${record.roleUUID}`}>
            <Switch
              size="small"
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              checked={status === "active"}
              loading={statusLoading === record.roleUUID}
              onChange={(checked) =>
                updateStatus(checked ? "active" : "inactive", record.roleUUID)
              }
            />
          </div>
        ),
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
        fixed: "right" as const,
        align: "center" as const,
        width: 70,
        render: (_: any, record: Role) => (
          <Dropdown
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
  }, [actionMenus, updateStatus, statusLoading, sorterConfig, statusFilter]);

  // Handle table changes (sorting, filtering, pagination)
  const handleTableChange = useCallback(
    (pagination: any, filters: Record<string, any>, sorter: any) => {
      // Handle sorting
      if (!Array.isArray(sorter) && sorter.field) {
        setSorterConfig({
          field: sorter.field as string,
          order: sorter.order as SortOrder,
        });
      } else if (!sorter || (Array.isArray(sorter) && sorter.length === 0)) {
        setSorterConfig({});
      }

      // Handle status filtering
      if (filters.status) {
        setStatusFilter(filters.status as string[]);
      } else {
        setStatusFilter([]);
      }
    },
    []
  );

  return (
    <>
      {contextHolder}
      <div ref={tableWrapperRef}>
        <ProTable<Role>
          columns={columns as any}
          bordered
          defaultSize="small"
          locale={{
            triggerDesc: "Sort descending",
            triggerAsc: "Sort ascending",
            cancelSort: "Clear sorting",
            emptyText: (
              <div className="py-10 text-center text-gray-500">
                <p className="text-lg font-medium">No Data found</p>
                <p className="text-sm">
                  Try adjusting your filters or search query.
                </p>
              </div>
            ),
          }}
          dataSource={processedData}
          onChange={handleTableChange}
          className="pro-table-customize"
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedRoles,
            onChange: (selectedRowKeys) => {
              setSelectedRoles(selectedRowKeys);
            },
          }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          options={{
            fullScreen: true,
            reload: () => refetch(),
            reloadIcon: (
              <RefreshCw
                size={16}
                className={`${
                  rolesLoading || isFetching ? "animate-spin" : ""
                }`}
              />
            ),
          }}
          toolbar={{
            actions: [
              <>
                <ExtraThings
                  selectedUsers={selectedRoles}
                  onBulkAction={handleBulkAction}
                />
              </>,
            ],
          }}
          search={false}
          headerTitle={
            <Input
              placeholder="Search Role..."
              allowClear
              value={searchTerm}
              onChange={handleSearchRole}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          }
          pagination={{
            size: "small",
            pageSizeOptions: [5, 10, 20, 50, 100],
            showQuickJumper: true,
            showSizeChanger: true,
          }}
          scroll={{ x: 1200, y: scrollY }}
          sticky
          loading={rolesLoading}
          rowKey="roleUUID"
        />
      </div>
    </>
  );
}

export default memo(RolesDataTable);

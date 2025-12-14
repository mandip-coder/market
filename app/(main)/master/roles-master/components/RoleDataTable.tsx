"use client";
import { useRoleStore } from "@/context/store/rolesStore";
import { useApi } from "@/hooks/useAPI";
import useColumnSearch from "@/hooks/useColumnSearch";
import { useLoading } from "@/hooks/useLoading";
import { useTableScroll } from "@/hooks/useTableScroll";
import { APIPATH } from "@/shared/constants/url";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import type { MenuProps } from "antd";
import { Button, Dropdown, Input, Modal, Switch, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import React, { memo, use, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ExtraThings } from "./RolesExtraThings";

dayjs.extend(relativeTime);

export interface Role {
  roleUUID: string;
  roleName: string;
  description: string;
  roleCode: string;
  isSystemRole: boolean;
  status: "active" | "inactive"
}

export interface RolesDataResponse {
  data: Role[]
}

interface PaginationParams {
  pageSize?: number;
  total?: number;
}

interface FetchParams {
  pagination?: PaginationParams;
  sorter?: any;
  filters?: any;
}

function RolesDataTable({ tableData }: { tableData: Promise<RolesDataResponse> }) {
  const fullData = use(tableData) as RolesDataResponse;
  const API = useApi()
  const { tableDataState, setTableDataState, toggleRolesDrawer, setEditRole } = useRoleStore();
  useEffect(() => {
    setTableDataState(fullData.data);
  }, [fullData, setTableDataState]);

  const [selectedRoles, setSelectedRoles] = useState<React.Key[]>([]);
  const getSearchProps = useColumnSearch();

  const [loading, setLoading] = useLoading();
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const { scrollY, tableWrapperRef } = useTableScroll();
  const [modal, contextHolder] = Modal.useModal();

  const handleEdit = useCallback((role: Role) => {
    setEditRole(role as any);
    toggleRolesDrawer();
  }, [setEditRole, toggleRolesDrawer]);

  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return tableDataState;

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return tableDataState.filter(role =>
      role.roleName.toLowerCase().includes(lowercasedSearchTerm) ||
      role.description.toLowerCase().includes(lowercasedSearchTerm) ||
      role.roleCode.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [tableDataState, searchTerm]);

  const clearSelection = useCallback(() => {
    setSelectedRoles([]);
  }, []);

  // Memoize action menus to prevent unnecessary re-renders
  const actionMenus = useCallback((record: Role): MenuProps['items'] => {
    const baseItems: MenuProps['items'] = [
      {
        key: "edit",
        label: "Edit",
        icon: <Edit size={14} />,
        onClick: () => {
          handleEdit(record);
        }
      },
      {
        key: "delete",
        label: "Delete",
        icon: <Trash size={14} />,
        danger: true,
        onClick: () => {
          modal.confirm({
            title: 'Delete Role',
            content: <span>Are you sure you want to delete <strong>{record.roleName}</strong>? This action cannot be undone.</span>,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            maskClosable: false,
            onOk: async () => {
              try {
                const res = await API.delete(`${APIPATH.ROLES.DELETEROLE}${record.roleUUID}`);
                if (res.status) {
                  setTableDataState(prevData => prevData.filter(role => role.roleUUID !== record.roleUUID));
                  toast.success(`Role ${record.roleName} deleted successfully`);
                } else {
                  toast.error(res.message);
                }
              } catch (error: any) {
                toast.error(error.message || "Failed to delete role");
              }
            }
          });
        }
      }
    ];

    return baseItems;
  }, [modal, handleEdit, API, setTableDataState]);

  const selectedCompniesData = useMemo(() => {
    return filteredData.filter(r => selectedRoles.includes(r.roleUUID));
  }, [filteredData, selectedRoles]);

  const fetchData = useCallback(async (params: FetchParams = {}) => {
    setLoading(true);

    try {
      const response = await API.get(APIPATH.ROLES.GETROLES);
      setTableDataState(response.data);

    } catch (error: any) {
      console.error("Error fetching data", error);
      toast.error(error.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTableDataState, API]);

  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'export':
        toast.info('Exporting...');
        break;

      case 'delete':
        modal.confirm({
          title: `Delete ${selectedRoles.length} User${selectedRoles.length > 1 ? 's' : ''}`,
          content: (
            <div>
              <p>Are you sure you want to delete {selectedRoles.length} companie{selectedRoles.length > 1 ? 's' : ''}?</p>
              <p className="text-red-500 mt-2">This action cannot be undone and will permanently remove data.</p>
              <div className="mt-2">
                <p className="font-semibold">Compnies to be deleted:</p>
                <ul className="list-disc list-inside mt-1">
                  {selectedCompniesData.map(role => (
                    <li key={role.roleUUID}>{role.roleName}</li>
                  ))}
                </ul>
              </div>
            </div>
          ),
          okText: 'Delete',
          okType: 'danger',
          cancelText: 'Cancel',
          okButtonProps: { type: "primary" },
          width: 700,
          onOk: async () => {
            try {
              const deleteRes = await API.post(`${APIPATH.ROLES.MUTLIPLEDELETEROLE}`, {
                "uuids": selectedRoles
              });
              if (deleteRes.status) {
                setTableDataState(prevData => prevData.filter(r => !selectedRoles.includes(r.roleUUID)));
                toast.success(`${selectedRoles.length} User${selectedRoles.length > 1 ? 's' : ''} deleted successfully`);
                clearSelection();
              } else {
                toast.error(deleteRes.message);
              }
            } catch (error: any) {
              toast.error(error.message || "Failed to delete roles");
            }
          },
        });
        break;
      default:
        break;
    }
  }, [selectedRoles, modal, selectedCompniesData, clearSelection, setTableDataState]);

  const updateStatus = useCallback(async (newStatus: Role['status'], roleUUID: Role['roleUUID']) => {
    setStatusLoading(roleUUID);
    try {
      await API.patch(APIPATH.ROLES.UPDATESTATUS(roleUUID), { status: newStatus });
      toast.success('Status updated successfully!');
      setTableDataState(prevData => prevData.map(role =>
        role.roleUUID === roleUUID ? { ...role, status: newStatus } : role
      ));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setStatusLoading(null);
    }
  }, [setTableDataState, API]);

  const handleSearchRole = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

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
        sorter: true,
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
      },
      {
        title: "Role Code",
        dataIndex: "roleCode",
        key: "roleCode",
        width: 150,
        minWidth: 150,
      },
      {
        title: "Is System Role",
        dataIndex: "isSystemRole",
        key: "isSystemRole",
        width: 150,
        minWidth: 150,
        sorter: true,
        render: (isSystemRole: Role["isSystemRole"]) => (
          <Tag color={isSystemRole ? "green" : "red"}>{isSystemRole ? "Yes" : "No"}</Tag>
        )
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        minWidth: 150,
        filters: [
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
        ],
        render: (status: Role["status"], record: Role) => (
          <div key={`status-${record.roleUUID}`}>
            <Switch
              size="small"
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              checked={status === 'active'}
              loading={!record.roleUUID &&( statusLoading === record.roleUUID)}
              onChange={(checked) => updateStatus(checked ? 'active' : 'inactive', record.roleUUID)}
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
  }, [actionMenus, updateStatus, statusLoading, tableDataState]);

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
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            ),
          }}
          dataSource={filteredData}
          request={async (params, sorter, filter) => {
            const apiParams: FetchParams = {
              pagination: { ...params },
              sorter,
              filters: filter,
            };
            await fetchData(apiParams);
            return {
              data: filteredData,
              success: true,
            };
          }}
          manualRequest
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
            reloadIcon: <ReloadOutlined spin={loading} />,
          }}
          toolbar={{
            actions: [
              <>
                <ExtraThings
                  selectedUsers={selectedRoles}
                  onBulkAction={handleBulkAction}
                />
              </>
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
          loading={loading}
          rowKey="roleUUID"
        />
      </div>
    </>
  );
}

export default memo(RolesDataTable);
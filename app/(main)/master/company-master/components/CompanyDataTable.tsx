"use client";
import { useCompanyStore } from "@/context/store/companyStore";
import { useApi } from "@/hooks/useAPI";
import useColumnSearch from "@/hooks/useColumnSearch";
import { useLoading } from "@/hooks/useLoading";
import { useTableScroll } from "@/hooks/useTableScroll";
import { APIPATH } from "@/shared/constants/url";
import {
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
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
  Space,
  Tag,
  Tooltip,
} from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import React, {
  memo,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { ExtraThings } from "./TableExtraThings";

dayjs.extend(relativeTime);

export interface Company {
  companyUUID: string;
  displayName: string;
  legalName: string;
  shortName: string;
  address: string;
  webUrl: string;
  logoUrl?: string | null;
  email: string;
  phone1: string;
  phone2?: string | null;
  phone3?: string | null;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "deleted";
  roles: {
    roleUUID: string;
    roleName: string;
  }[];
  products: {
    productUUID: string;
    productName: string;
  }[];
  rolesUUID?: string[];
  productsUUID?: string[];
}

export interface CompanyDataResponse {
  data: {
    companies: Company[];
    total: number;
    page: number;
    limit: number;
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

function CompnayDataTable({
  tableData,
}: {
  tableData: Promise<CompanyDataResponse>;
}) {
  const fullData = use(tableData) as CompanyDataResponse;
  const API = useApi();
  const {
    tableDataState,
    setTableDataState,
    toggleCompanyDrawer,
    setEditCompany,
  } = useCompanyStore();
  useEffect(() => {
    setTableDataState(fullData.data.companies);
  }, [fullData]);
  const [selectedCompnies, setSelectedCompnies] = useState<React.Key[]>([]);
  const getSearchProps = useColumnSearch();
  const [pagination, setPagination] = useState<PaginationParams>({
    pageSize: fullData.data.limit,
    total: fullData.data.total,
  });
  const [loading, setLoading] = useLoading();
  const { scrollY, tableWrapperRef } = useTableScroll();
  const [modal, contextHolder] = Modal.useModal();
  const handleEdit = useCallback((company: Company) => {
    setEditCompany(company as any);
    toggleCompanyDrawer();
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCompnies([]);
  }, []);
  // Memoize action menus to prevent unnecessary re-renders
  const actionMenus = useCallback(
    (record: Company): MenuProps["items"] => {
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
              title: "Delete Company",
              content: (
                <span>
                  Are you sure you want to delete{" "}
                  <strong>{record.displayName}</strong>? This action cannot be
                  undone.
                </span>
              ),
              okText: "Delete",
              okType: "danger",
              cancelText: "Cancel",
              maskClosable: false,
              onOk: async () => {
                try {
                  const res = await API.delete(
                    `${APIPATH.COMPANY.DELETECOMPANY}${record.companyUUID}`
                  );
                  if (res.status) {
                    setTableDataState((prevData) =>
                      prevData.filter(
                        (user) => user.companyUUID !== record.companyUUID
                      )
                    );
                    toast.success(
                      `Company ${record.displayName} deleted successfully`
                    );
                  } else {
                    toast.error(res.message);
                  }
                } catch (error: any) {
                  toast.error(error.message || "Failed to delete company");
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

  const getPhoneNumberRender = useCallback((record: Company) => {
    if (!record.phone1) {
      return (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <PhoneOutlined className="text-base" />
          <span className="italic">No phone number</span>
        </div>
      );
    }

    const phones: { value: string }[] = [];
    if (record.phone1) {
      phones.push({ value: record.phone1 });
    }
    if (record.phone2) {
      phones.push({ value: record.phone2 });
    }
    if (record.phone3) {
      phones.push({ value: record.phone3 });
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

  const selectedCompniesData = useMemo(() => {
    return tableDataState.filter((c) =>
      selectedCompnies.includes(c.companyUUID)
    );
  }, [tableDataState, selectedCompnies]);

  const fetchData = useCallback(
    async (params: FetchParams = {}) => {
      setLoading(true);

      try {
        const response = await API.get(APIPATH.COMPANY.GETCOMPANIES);
        setTableDataState(response.data.companies);
        setPagination({
          total: response.data.total,
          pageSize: response.data.limit,
        });
      } catch (error: any) {
        console.error("Error fetching data", error);
        toast.error(error.message || "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setTableDataState, setPagination, tableDataState]
  );
  const handleBulkAction = useCallback(
    (action: string) => {
      switch (action) {
        case "export":
          toast.info("Exporting...");
          break;

        case "delete":
          modal.confirm({
            title: `Delete ${selectedCompnies.length} User${
              selectedCompnies.length > 1 ? "s" : ""
            }`,
            content: (
              <div>
                <p>
                  Are you sure you want to delete {selectedCompnies.length}{" "}
                  companie{selectedCompnies.length > 1 ? "s" : ""}?
                </p>
                <p className="text-red-500 mt-2">
                  This action cannot be undone and will permanently remove data.
                </p>
                <div className="mt-2">
                  <p className="font-semibold">Compnies to be deleted:</p>
                  <ul className="list-disc list-inside mt-1">
                    {selectedCompniesData.map((company) => (
                      <li key={company.companyUUID}>{company.displayName}</li>
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
                  (c) => !selectedCompnies.includes(c.companyUUID)
                )
              );
              toast.success(
                `${selectedCompnies.length} User${
                  selectedCompnies.length > 1 ? "s" : ""
                } deleted successfully`
              );
              clearSelection();
            },
          });
          break;
        default:
          break;
      }
    },
    [selectedCompnies, modal, selectedCompniesData, clearSelection]
  );
  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "Display Name",
        dataIndex: "displayName",
        key: "displayName",
        fixed: "left",
        width: 150,
        sorter: true,
        render: (text: string) => (
          <Tooltip title={text}>
            <span className="font-semibold">{text}</span>
          </Tooltip>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 190,
        sorter: true,
        render: (text: string) => (
          <Tooltip title={text}>
            <span className="font-semibold">{text}</span>
          </Tooltip>
        ),
      },
      {
        title: "Website",
        width: 150,
        dataIndex: "webUrl",
        key: "webUrl",
      },
      {
        title: "Roles",
        width: 80,
        dataIndex: "roles",
        key: "roles",
        render: (roles: Company["roles"]) => {
          return (<>
            {roles.length > 1 ?<Tooltip
              title={
                <div className="flex gap-1 flex-wrap">
                  {roles.map((role) => (
                    <Tag variant="filled" color="blue" key={role.roleUUID}>{role.roleName}</Tag>
                  ))}
                </div>
              }
            >
              <Tag variant="filled" color="pink" className="cursor-pointer">
                View ({roles.length})
              </Tag>
            </Tooltip>:<p className="text-gray-500">No role assigned</p>}</>
          );
        },
      },
      {
        title: "Products",
        width: 100,
        dataIndex: "products",
        key: "products",
        render: (products: Company["products"]) => {
          return (<>
            {products.length > 1 ?<Tooltip
              title={
                <div className="flex gap-1 flex-wrap">
                  {products.map((product) => (
                    <Tag variant="filled" color="blue" key={product.productUUID}>{product.productName}</Tag>
                  ))}
                </div>
              }
            >
              <Tag variant="filled" color="pink" className="cursor-pointer">
                View ({products.length})
              </Tag>
            </Tooltip>:<p className="text-gray-500">No product assigned</p>}</>
          );
        },
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
        render: (text: string) => (
          <Paragraph title={text} ellipsis={{ tooltip: text, rows: 2 }}>
            <span className="font-semibold">{text}</span>
          </Paragraph>
        ),
        width: 100,
      },
      {
        title: "Phone",
        key: "phone",
        width: 130,
        render: (record: Company) => getPhoneNumberRender(record),
      },
      {
        title: "Short Name",
        dataIndex: "shortName",
        key: "shortName",
        width: 100,
        sorter: true,
      },
      {
        title: "Legal Name",
        dataIndex: "legalName",
        key: "legalName",
        width: 100,
        sorter: true,
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
        render: (_: any, record: Company) => (
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
  }, [getSearchProps, actionMenus]);
  return (
    <>
      {contextHolder}
      <div ref={tableWrapperRef}>
        <ProTable<Company>
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
              total: pagination.total || 0,
              success: true,
            };
          }}
          manualRequest
          className="pro-table-customize"
          // rowSelection={{
          //   type: "checkbox",
          //   selectedRowKeys: selectedCompnies,
          //   onChange: (selectedRowKeys) => {
          //     setSelectedCompnies(selectedRowKeys);
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
              <>
                <ExtraThings
                  selectedUsers={selectedCompnies}
                  onBulkAction={handleBulkAction}
                />
              </>,
            ],
          }}
          search={false}
          headerTitle={
            <Input
              placeholder="Search Company..."
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
          scroll={{ x: 2000, y: scrollY }}
          sticky
          loading={loading}
          rowKey="companyUUID"
        />
      </div>
    </>
  );
}

export default memo(CompnayDataTable);

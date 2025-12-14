"use client";
import { useProductStore, Product } from "@/context/store/productStore";
import { useApi } from "@/hooks/useAPI";
import { useLoading } from "@/hooks/useLoading";
import { useTableScroll } from "@/hooks/useTableScroll";
import { APIPATH } from "@/shared/constants/url";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import type { MenuProps } from "antd";
import { Button, Dropdown, Input, Modal, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import React, { memo, use, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ExtraThings } from "./TableExtraThings";
import debounce from "lodash.debounce";
dayjs.extend(relativeTime);

export interface ProductDataResponse {
  data: Product[]
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

function ProductDataTable({ tableData }: { tableData: Promise<ProductDataResponse> }) {
  const responseData = use(tableData)
  const fullData = responseData.data
  const API = useApi();
  const { tableDataState, setTableDataState, toggleProductDrawer, setEditProduct } = useProductStore();
  const [filterData, setFilterData] = useState<Product[]>(tableDataState)
  useEffect(() => {
    setTableDataState(fullData);
    setFilterData(fullData)
  }, [fullData, setTableDataState]);

  const [selectedProducts, setSelectedProducts] = useState<React.Key[]>([]);

  const [loading, setLoading] = useLoading();
  const { scrollY, tableWrapperRef } = useTableScroll();
  const [modal, contextHolder] = Modal.useModal();

  const handleEdit = useCallback((product: Product) => {
    setEditProduct(product);
    toggleProductDrawer();
  }, [setEditProduct, toggleProductDrawer]);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const actionMenus = useCallback((record: Product): MenuProps['items'] => {
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
            title: 'Delete Product',
            content: <span>Are you sure you want to delete <strong>{record.productName}</strong>? This action cannot be undone.</span>,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            maskClosable: false,
            onOk: async () => {

              const res = await API.delete(`${APIPATH.PRODUCTS.DELETEPRODUCT}${record.productUUID}`);
              if (res) {
                setTableDataState(prevData => prevData.filter(p => p.productUUID !== record.productUUID));
                toast.success(`Product ${record.productName} deleted successfully`);
              }

            }
          });
        }
      }
    ];

    return baseItems;
  }, [modal, API, setTableDataState, handleEdit]);

  const selectedProductsData = useMemo(() => {
    return tableDataState.filter(p => selectedProducts.includes(p.productUUID));
  }, [tableDataState, selectedProducts]);

  const fetchData = useCallback(async (params: FetchParams = {}) => {
    setLoading(true);

    const response = await API.get(APIPATH.PRODUCTS.GETPRODUCTS);
    if (response) {
      setTableDataState(response.data);
      setFilterData(response.data)
    }
    setLoading(false);
  }, [setLoading, setTableDataState, API]);

  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'export':
        toast.info('Exporting products...');
        break;

      case 'delete':
        modal.confirm({
          title: `Delete ${selectedProducts.length} Product${selectedProducts.length > 1 ? 's' : ''}`,
          content: (
            <div>
              <p>Are you sure you want to delete {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''}?</p>
              <p className="text-red-500 mt-2">This action cannot be undone and will permanently remove data.</p>
              <div className="mt-2">
                <p className="font-semibold">Products to be deleted:</p>
                <ul className="list-disc list-inside mt-1">
                  {selectedProductsData.map(product => (
                    <li key={product.productUUID}>{product.productName}</li>
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
              // In a real scenario, you'd call a bulk delete API
              setTableDataState(prevData => prevData.filter(p => !selectedProducts.includes(p.productUUID)));
              toast.success(`${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} deleted successfully`);
              clearSelection();
            } catch (error: any) {
              toast.error(error.message || "Failed to delete products");
            }
          },
        });
        break;
      default:
        break;
    }
  }, [selectedProducts, modal, selectedProductsData, clearSelection, setTableDataState]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "Product Name",
        dataIndex: "productName",
        key: "productName",
        fixed: "left",
        width: 200,
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
        ellipsis: true,
        render: (text: string) => (
          <Tooltip title={text}>
            <span>{text || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        filters: [
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
        ],
        render: (status: string) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        sorter: true,
        render: (date: string) => {
          if (!date) return '-';
          return (
            <div>
              <div className="mb-1">{dayjs(date).format('MMM DD, YYYY')}</div>
              <Tag>{dayjs(date).fromNow()}</Tag>
            </div>
          );
        },
      },
      {
        title: "Updated At",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
        sorter: true,
        render: (date: string) => {
          if (!date) return '-';
          return (
            <div>
              <div className="mb-1">{dayjs(date).format('MMM DD, YYYY')}</div>
              <Tag variant="outlined">{dayjs(date).fromNow()}</Tag>
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
        fixed: "right" as const,
        align: "center" as const,
        width: 70,
        render: (_: any, record: Product) => (
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
  }, [actionMenus]);

  const handleFilterProducts = useMemo(
    () =>
      debounce((value: string) => {
        const filteredData = tableDataState.filter((product) =>
          product.productName.toLowerCase().includes(value.toLowerCase())
        );
        setFilterData(filteredData);
      }, 500),
    [tableDataState]
  );

  return (
    <>
      {contextHolder}
      <div ref={tableWrapperRef}>
        <ProTable<Product>
          columns={columns as any}
          bordered
          defaultSize="small"
          locale={{
            triggerDesc: "Sort descending",
            triggerAsc: "Sort ascending",
            cancelSort: "Clear sorting",
            emptyText: (
              <div className="py-10 text-center text-gray-500">
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            ),
          }}
          dataSource={filterData}
          request={async (params, sorter, filter) => {
            const apiParams: FetchParams = {
              pagination: { ...params },
              sorter,
              filters: filter,
            };
            await fetchData(apiParams);
            return {
              data: tableDataState,
              success: true,
            };
          }}
          manualRequest
          className="pro-table-customize"
          // rowSelection={{
          //   type: "checkbox",
          //   selectedRowKeys: selectedProducts,
          //   onChange: (selectedRowKeys) => {
          //     setSelectedProducts(selectedRowKeys);
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
              <ExtraThings
                key="extra-things"
                selectedProducts={selectedProducts}
                onBulkAction={handleBulkAction}
              />
            ],
          }}
          search={false}
          headerTitle={<Input
            placeholder="Search products..."
            allowClear
            onChange={(e) => handleFilterProducts(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />}
          pagination={{
            size: "small",
            pageSizeOptions: [5, 10, 20, 50, 100],
            showQuickJumper: true,
            showSizeChanger: true,
          }}
          scroll={{ x: 1200, y: scrollY }}
          sticky
          loading={loading}
          rowKey="productUUID"
        />
      </div>
    </>
  );
}

export default memo(ProductDataTable);

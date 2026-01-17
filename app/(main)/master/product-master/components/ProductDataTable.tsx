"use client";
import {
  useDeleteProduct,
  useProductsList,
} from "@/app/(main)/products/services/products.hooks";
import { Product } from "@/app/(main)/products/services/types";
import { useProductStore } from "@/context/store/productStore";
import { useTableScroll } from "@/hooks/useTableScroll";

import { SearchOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import type { MenuProps } from "antd";
import { Button, Dropdown, Input, Modal, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import debounce from "lodash.debounce";
import { Edit, MoreHorizontal, RefreshCw, Trash } from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { ExtraThings } from "./TableExtraThings";
dayjs.extend(relativeTime);

export interface ProductDataResponse {
  data: Product[];
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

function ProductDataTable() {
  const { toggleProductDrawer, setEditProduct } = useProductStore();
  const {
    data: products = [],
    isLoading: isProductsLoading,
    refetch,
    isRefetching,
  } = useProductsList();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<React.Key[]>([]);

  const { scrollY, tableWrapperRef } = useTableScroll();
  const [modal, contextHolder] = Modal.useModal();

  const handleEdit = useCallback(
    (product: Product) => {
      setEditProduct(product);
      toggleProductDrawer();
    },
    [setEditProduct, toggleProductDrawer]
  );

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const actionMenus = useCallback(
    (record: Product): MenuProps["items"] => {
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
              title: "Delete Product",
              content: (
                <span>
                  Are you sure you want to delete{" "}
                  <strong>{record.productName}</strong>? This action cannot be
                  undone.
                </span>
              ),
              okText: "Delete",
              okType: "danger",
              cancelText: "Cancel",
              maskClosable: false,
              onOk: async () => {
                  await deleteProduct(record.productUUID);
              },
            });
          },
        },
      ];

      return baseItems;
    },
    [modal, deleteProduct, handleEdit]
  );

  const selectedProductsData = useMemo(() => {
    return products.filter((p) => selectedProducts.includes(p.productUUID));
  }, [products, selectedProducts]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleBulkAction = useCallback(
    (action: string) => {
      switch (action) {
        case "export":
          toast.info("Exporting products...");
          break;

        case "delete":
          modal.confirm({
            title: `Delete ${selectedProducts.length} Product${
              selectedProducts.length > 1 ? "s" : ""
            }`,
            content: (
              <div>
                <p>
                  Are you sure you want to delete {selectedProducts.length}{" "}
                  product{selectedProducts.length > 1 ? "s" : ""}?
                </p>
                <p className="text-red-500 mt-2">
                  This action cannot be undone and will permanently remove data.
                </p>
                <div className="mt-2">
                  <p className="font-semibold">Products to be deleted:</p>
                  <ul className="list-disc list-inside mt-1">
                    {selectedProductsData.map((product) => (
                      <li key={product.productUUID}>{product.productName}</li>
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
                // In a real scenario, you'd call a bulk delete API
                // setTableDataState(prevData => prevData.filter(p => !selectedProducts.includes(p.productUUID)));
                toast.success(
                  `${selectedProducts.length} product${
                    selectedProducts.length > 1 ? "s" : ""
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
    [selectedProducts, modal, selectedProductsData, clearSelection]
  );

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "Product Name",
        dataIndex: "productName",
        key: "productName",
        fixed: "left",
        width: 200,
        sorter: (a: Product, b: Product) =>
          a.productName.localeCompare(b.productName),
        render: (text: string) => (
          <Tooltip title={text}>
            <span className="font-semibold">{text}</span>
          </Tooltip>
        ),
      },{
        title: "Therapeutic Area",
        dataIndex: "therapeuticArea",
        key: "therapeuticArea",
        width: 200,
        sorter: (a: Product, b: Product) =>
          a.therapeuticArea.localeCompare(b.therapeuticArea),
        render: (text: string) => (
            <span className="font-semibold">{text}</span>
        ),
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        sorter: (a: Product, b: Product) =>
          dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        render: (date: string) => {
          if (!date) return "-";
          return (
            <div>
              <div className="mb-1">{dayjs(date).format("MMM DD, YYYY")}</div>
              <Tag variant="outlined">{dayjs(date).fromNow()}</Tag>
            </div>
          );
        },
      },
      {
        title: "Updated At",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
        sorter: (a: Product, b: Product) =>
          dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
        render: (date: string) => {
          if (!date) return "-";
          return (
            <div>
              <div className="mb-1">{dayjs(date).format("MMM DD, YYYY")}</div>
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
        setSearchTerm(value);
      }, 500),
    []
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
                <p className="text-sm">
                  Try adjusting your filters or search query.
                </p>
              </div>
            ),
          }}
          dataSource={filteredData}
          loading={isProductsLoading}
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
            reloadIcon: (
              <RefreshCw
                size={16}
                className={`${
                  isProductsLoading || isRefetching ? "animate-spin" : ""
                }`}
              />
            ),
            reload: () => refetch(),
          }}
          toolbar={{
            actions: [
              <ExtraThings
                key="extra-things"
                selectedProducts={selectedProducts}
                onBulkAction={handleBulkAction}
              />,
            ],
          }}
          search={false}
          headerTitle={
            <Input
              placeholder="Search products..."
              allowClear
              onChange={(e) => handleFilterProducts(e.target.value)}
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
          rowKey="productUUID"
        />
      </div>
    </>
  );
}

export default memo(ProductDataTable);

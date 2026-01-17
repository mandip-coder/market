"use client";
import InputBox from "@/components/Input/Input";
import ModalWrapper from "@/components/Modal/Modal";
import { Product } from "@/app/(main)/products/services/types";
import { Product as DropdownProduct } from "@/services/dropdowns/dropdowns.types";
import { SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Button, Input, Modal, Table } from "antd";
import { Form, Formik } from "formik";
import debounce from "lodash/debounce";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Yup from "yup";
import { EmptyState } from "./EmptyState";
import { UseMutationResult } from "@tanstack/react-query";
import {
  AddDealProductPayload,
  DeleteDealProductPayload,
} from "@/app/(main)/deals/services/deals.hooks";
import {
  useProducts,
  useDropdownDealStages,
} from "@/services/dropdowns/dropdowns.hooks";

export const ProductCard = memo<{
  product: Product;
  onDeleteRequest: (product: Product) => void;
  isDeleting?: boolean;
}>(({ product, onDeleteRequest, isDeleting = false }) => {
  const handleRemove = useCallback(() => {
    onDeleteRequest(product);
  }, [onDeleteRequest, product]);

  return (
    <div
      role="article"
      aria-label={`Product ${product.productName}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-600 ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Package size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight mb-1 truncate">
              {product.productName}
            </h3>
          </div>
        </div>
        <Button
          onClick={handleRemove}
          disabled={isDeleting}
          type="text"
          danger
          icon={<Trash2 size={18} />}
        />
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3 flex-1">
        {/* Generic Name */}

        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
            Therapeutic Area:
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            {product.therapeuticArea || "Not Provided"}
          </span>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

interface ProductModalProps {
  selectedProducts: Product[];
  addProductMutation: UseMutationResult<
    Product,
    Error,
    AddDealProductPayload,
    unknown
  >;
  deleteProductMutation: UseMutationResult<
    void,
    Error,
    DeleteDealProductPayload,
    unknown
  >;
  stage?: string; // dealStageUUID
  showReasonModal?: boolean;
  dealUUID?: string;
  leadUUID?: string;
  refetching?: boolean;
  refetch?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  selectedProducts,
  addProductMutation,
  deleteProductMutation,
  stage,
  showReasonModal = false,
  dealUUID,
  leadUUID,
  refetching,
  refetch,
}) => {
  const [selectedQuery, setSelectedQuery] = useState("");
  const [debouncedSelectedQuery, setDebouncedSelectedQuery] = useState("");
  const selectedDebouncedRef = useRef<ReturnType<typeof debounce> | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const { data: availableProducts = [], isLoading } = useProducts({
    enabled: openModal,
  });

  const [modalQuery, setModalQuery] = useState("");
  const [debouncedModalQuery, setDebouncedModalQuery] = useState("");
  const modalDebouncedRef = useRef<ReturnType<typeof debounce> | null>(null);
  const { data: dealStages = [] } = useDropdownDealStages();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Initialize debounced functions
  useEffect(() => {
    selectedDebouncedRef.current = debounce((val: string) => {
      setDebouncedSelectedQuery(val);
    }, 300);

    return () => {
      selectedDebouncedRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    modalDebouncedRef.current = debounce((val: string) => {
      setDebouncedModalQuery(val);
    }, 300);

    return () => {
      modalDebouncedRef.current?.cancel();
    };
  }, []);

  // Filter products available in modal (exclude already selected)
  const filteredProducts = useMemo(() => {
    const selectedIds = new Set(selectedProducts.map((p) => p.productUUID));
    return availableProducts
      .filter((product) => !selectedIds.has(product.productUUID))
      .filter((product) =>
        product.productName
          .toLowerCase()
          .includes(debouncedModalQuery.toLowerCase())
      );
  }, [debouncedModalQuery, availableProducts, selectedProducts]);

  // Filter selected products based on search
  const filteredSelectedProducts = useMemo(() => {
    if (!debouncedSelectedQuery) return selectedProducts;

    return selectedProducts.filter((product) =>
      product.productName
        .toLowerCase()
        .includes(debouncedSelectedQuery.toLowerCase())
    );
  }, [debouncedSelectedQuery, selectedProducts]);

  const onClose = useCallback(() => {
    setOpenModal(false);
    setModalQuery("");
    setDebouncedModalQuery("");
  }, []);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleRemoveProduct = useCallback(
    (
      product: Product,
      reason?: string,
      resetForm?: () => void,
      setSubmitting?: (isSubmitting: boolean) => void
    ) => {
      setDeletingProductId(product.productUUID);

      deleteProductMutation.mutate(
        {
          productUUID: product.productUUID,
          dealUUID: dealUUID || leadUUID || "",
          reason,
        },
        {
          onSuccess: () => {
            setProductToDelete(null);
            setReasonModalOpen(false);
            resetForm?.();
            setSubmitting?.(false);
            setDeletingProductId(null);
          },
          onError: () => {
            setDeletingProductId(null);
            setSubmitting?.(false);
          },
        }
      );
    },
    [dealUUID, leadUUID, deleteProductMutation]
  );

  const handleDeleteRequest = useCallback(
    (product: Product) => {
      if (showReasonModal && stage) {
        setProductToDelete(product);
        setReasonModalOpen(true);
      } else {
        handleRemoveProduct(product);
      }
    },
    [showReasonModal, stage, handleRemoveProduct]
  );

  const handleAddProduct = useCallback(
    (product: DropdownProduct) => {
      setAddingProductId(product.productUUID);

      addProductMutation.mutate(
        {
          productUUID: product.productUUID,
          dealUUID: dealUUID || leadUUID || "",
        },
        {
          onSuccess: () => {
            setAddingProductId(null);
          },
          onError: () => {
            setAddingProductId(null);
          },
        }
      );
    },
    [dealUUID, leadUUID, addProductMutation]
  );

  const handleSelectedSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setSelectedQuery(v);
      selectedDebouncedRef.current?.(v);
    },
    []
  );

  const handleModalSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setModalQuery(v);
      modalDebouncedRef.current?.(v);
    },
    []
  );

  const handleClearSelectedSearch = useCallback(() => {
    setSelectedQuery("");
    setDebouncedSelectedQuery("");
    selectedDebouncedRef.current?.cancel();
  }, []);

  const handleClearModalSearch = useCallback(() => {
    setModalQuery("");
    setDebouncedModalQuery("");
    modalDebouncedRef.current?.cancel();
  }, []);

  // Formik validation schema
  const reasonValidationSchema = Yup.object().shape({
    reason: Yup.string()
      .required("Please provide a reason for removal")
      .min(5, "Reason must be at least 5 characters long"),
  });

  const initialFormValues = {
    reason: "",
  };

  const columns: TableProps<DropdownProduct>["columns"] = [
    {
      title: "Action",
      key: "action",
      fixed: "left",
      render: (_, record) => {
        const isSelected = selectedProducts.some(
          (p) => p.productUUID === record.productUUID
        );
        const isAdding = addingProductId === record.productUUID;

        return (
          <Button
            type="primary"
            size="small"
            onClick={() => handleAddProduct(record)}
            disabled={isSelected || isAdding}
            loading={isAdding}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
          >
            {!isAdding && <Plus size={15} />}
            {isSelected ? "Added" : "Add"}
          </Button>
        );
      },
      width: 100,
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (text) => (
        <div className="font-medium text-gray-900 dark:text-white">{text}</div>
      ),
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0">
          Associated Products
        </h3>
        <Button
          type="primary"
          onClick={handleOpenModal}
          icon={<Plus size={16} />}
          className="flex items-center gap-1"
        >
          Add Product
        </Button>
      </div>

        <div className="mb-6 flex items-center gap-2 justify-between">
          <Input
            placeholder="Search selected products by name or code..."
            prefix={<Search size={16} className="text-gray-400" />}
            onChange={handleSelectedSearchChange}
            value={selectedQuery}
            className="w-full max-w-md"
            allowClear
            onClear={handleClearSelectedSearch}
          />
          <Button
            size="small"
            icon={
              <RefreshCw
                size={16}
                className={refetching ? "animate-spin" : ""}
              />
            }
            onClick={refetch}
            title="Refresh calls"
          >
            Refresh
          </Button>
        </div>

      {filteredSelectedProducts?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSelectedProducts.map((product) => (
            <ProductCard
              key={product.productUUID}
              product={product}
              onDeleteRequest={handleDeleteRequest}
              isDeleting={deletingProductId === product.productUUID}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          searchQuery={debouncedSelectedQuery || selectedQuery}
          onClearSearch={handleClearSelectedSearch}
          onAction={handleOpenModal}
          icon={ShoppingCart}
          emptyTitle="No Associated Products"
          emptyDescription="Add products to track related items and services."
          actionLabel="Add First Product"
        />
      )}

      <ModalWrapper
        title="Select Products"
        open={openModal}
        onCancel={onClose}
        width={800}
        footer={null}
      >
        <div className="mb-4">
          <Input
            placeholder="Search products in table..."
            prefix={<SearchOutlined />}
            value={modalQuery}
            onChange={handleModalSearchChange}
            allowClear
            onClear={handleClearModalSearch}
          />
        </div>

        <Table<DropdownProduct>
          columns={columns}
          dataSource={filteredProducts}
          loading={isLoading}
          rowKey="productUUID"
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ y: 300 }}
          size="middle"
          className="product-table"
          rowClassName={(_, index) =>
            index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""
          }
        />
      </ModalWrapper>

      {showReasonModal && stage && (
        <Formik
          initialValues={initialFormValues}
          validationSchema={reasonValidationSchema}
          onSubmit={(values, { resetForm, setSubmitting }) => {
            if (productToDelete !== null) {
              handleRemoveProduct(
                productToDelete,
                values.reason,
                resetForm,
                setSubmitting
              );
            }
          }}
        >
          {({ handleSubmit, resetForm, isSubmitting, isValid }) => (
            <Modal
              title="Reason for Removal"
              open={reasonModalOpen}
              onOk={() => handleSubmit()}
              onCancel={() => {
                setProductToDelete(null);
                setReasonModalOpen(false);
                resetForm();
              }}
              okText="Remove Product"
              okType="danger"
              cancelText="Cancel"
              okButtonProps={{
                type: "primary",
                loading: isSubmitting,
                disabled: isSubmitting || !isValid,
              }}
              cancelButtonProps={{
                disabled: isSubmitting,
              }}
              centered
            >
              <div>
                <p className="mb-4">
                  Please provide a reason for removing{" "}
                  <strong>{productToDelete?.productName}</strong> from the{" "}
                  <strong>
                    {dealStages.find((s) => s.dealStageUUID === stage)
                      ?.dealStageName || "current"}
                  </strong>{" "}
                  stage:
                </p>
                <Form>
                  <div className="mt-4 mb-6">
                    <InputBox
                      name="reason"
                      label="Reason"
                      placeholder="Please specify the reason"
                      required
                    />
                  </div>
                </Form>
              </div>
            </Modal>
          )}
        </Formik>
      )}
    </div>
  );
};

export default React.memo(ProductModal);

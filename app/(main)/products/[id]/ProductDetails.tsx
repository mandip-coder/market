"use client";

import { ProductDocument } from "@/app/(main)/products/services/types";
import { GlobalDate } from "@/Utils/helpers";
import dayjs from "dayjs";
import { TrackerTab } from "../../healthcares/[id]/HelathCareTabs";

import LeadDrawer from "@/app/(main)/leads/components/LeadDrawer";
import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import { useDropdownProductDocumentCategories } from "@/services/dropdowns/dropdowns.hooks";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  Modal,
  Skeleton,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  Folder,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from '@/components/AppToaster/AppToaster';
import {
  useDeleteProductDocument,
  useFetchProductDocuments,
  useProductById,
  useUpdateDocumentStatus,
} from "../services/products.hooks";
import { CoverageAnalyticsTab } from "./components/CoverageAnalyticsTab";
import { ProductCoverageView } from "./components/ProductCoverageView";
import { RecommendationsTab } from "./components/RecommendationsTab";
import {
  EditDocumentButton,
  UploadDocumentModal,
} from "./components/UploadDocument";
import { useFetchProductDeals } from "./services/productDeals.hooks";
import ProductDetailsHeader from "./components/ProductDetailsHeader";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import { ApiError } from "@/lib/apiClient/ApiError";

const { Title } = Typography;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TabType =
  | "coverage"
  | "analytics"
  | "recommendations"
  | "documents"
  | "icb"
  | "deal";

interface ProductDetailsTabsProps {
  id: string;
}

interface RepositoryTabProps {
  productUUID: string;
}

interface DocumentCategory {
  documentcategoryUUID: string;
  documentcategoryName: string;
}

interface EmptyAccessRepositoryProps {}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_COLORS = [
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "cyan",
] as const;

const SKELETON_ITEMS = Array.from({ length: 10 }, (_, i) => i + 1);
const SKELETON_CATEGORIES = Array.from({ length: 4 }, (_, i) => i + 1);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get category color based on index
 * @param index - Category index
 * @returns Color string
 */
const getCategoryColor = (index: number): string => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

/**
 * Filter documents based on search term
 * @param docs - Array of documents
 * @param searchTerm - Search query
 * @returns Filtered documents
 */
const filterDocumentsBySearch = (
  docs: ProductDocument[],
  searchTerm: string
): ProductDocument[] => {
  if (!searchTerm) return docs;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return docs.filter(
    (doc) =>
      doc.documentName.toLowerCase().includes(lowerSearchTerm) ||
      doc.createdBy.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Group documents by category UUID
 * @param documents - Array of documents
 * @returns Grouped documents by category
 */
const groupDocumentsByCategory = (
  documents: ProductDocument[]
): Record<string, ProductDocument[]> => {
  return documents.reduce((grouped, doc) => {
    if (!grouped[doc.documentCategoryUUID]) {
      grouped[doc.documentCategoryUUID] = [];
    }
    grouped[doc.documentCategoryUUID].push(doc);
    return grouped;
  }, {} as Record<string, ProductDocument[]>);
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Empty state component when no access repository is found
 */
export const EmptyAccessRepository = memo<EmptyAccessRepositoryProps>(() => {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex flex-col items-center">
        <p className="!text-lg text-gray-500 dark:text-gray-400 font-semibold">
          No Access Repository Found
        </p>
        <br />
        <p className="!text-lg text-gray-500 dark:text-gray-400 font-semibold">
          Please contact to admin
        </p>
      </div>
    </div>
  );
});

EmptyAccessRepository.displayName = "EmptyAccessRepository";

/**
 * Repository tab component for managing product documents
 */
const RepositoryTab = memo<RepositoryTabProps>(({ productUUID }) => {
  const {
    data: documents = [],
    isLoading: documentsLoading,
    isFetching,
    refetch,
    error
  } = useFetchProductDocuments(productUUID);

  const { data: documentCategories = [] } =
    useDropdownProductDocumentCategories();

  const { mutateAsync: deleteDocument } = useDeleteProductDocument();
  const { mutateAsync: updateDocumentStatus } = useUpdateDocumentStatus();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [modal, contextHolder] = Modal.useModal();

  // Initialize selected categories when documentCategories are loaded
  useEffect(() => {
    if (documentCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(
        documentCategories.map(
          (cat: DocumentCategory) => cat.documentcategoryUUID
        )
      );
    }
  }, [documentCategories, selectedCategories.length]);

  // Group documents by category
  const documentsByCategory = useMemo(
    () => groupDocumentsByCategory(documents),
    [documents]
  );

  // Toggle category selection
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Handle document deletion
  const handleDelete = useCallback(
    async (doc: ProductDocument) => {
      modal.confirm({
        title: "Delete Document",
        content: (
          <div>
            <p>Are you sure you want to delete this document?</p>
            <p className="font-semibold mt-2">{doc.documentName}</p>
            <p className="text-sm text-slate-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
        ),
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          setDeletingDocId(doc.productDocumentUUID);
          try {
            await deleteDocument({
              productUUID,
              productDocumentUUID: doc.productDocumentUUID,
            });
            toast.success("Document deleted successfully!");
          } catch (error: any) {
            console.error("Delete error:", error);
            toast.error(
              error?.response?.data?.message || "Failed to delete document"
            );
          } finally {
            setDeletingDocId(null);
          }
        },
      });
    },
    [modal, deleteDocument, productUUID]
  );

  // Handle document download
  const handleDownload = useCallback((doc: ProductDocument) => {
    window.open(doc.url, "_blank");
  }, []);

  // Handle sensitive toggle
  const handleSensitiveToggle = useCallback(
    async (doc: ProductDocument, checked: boolean) => {
      const newSensitiveValue = !checked;
      try {
        await updateDocumentStatus({
          productUUID,
          productDocumentUUID: doc.productDocumentUUID,
          sensitive: newSensitiveValue,
        });
        toast.success("Document status updated successfully!");
      } catch (error: any) {
        console.error("Update error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to update document status"
        );
      }
    },
    [updateDocumentStatus, productUUID]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Show skeleton while loading
  if (documentsLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Skeleton.Input active className="w-full max-w-md" />
          <Skeleton.Button active />
        </div>

        {/* Category Filters Skeleton */}
        <div className="flex flex-wrap gap-2">
          {SKELETON_CATEGORIES.map((i) => (
            <Skeleton.Button key={i} active size="small" />
          ))}
        </div>

        {/* Documents Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {SKELETON_ITEMS.map((i) => (
            <Card key={i} size="small">
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if(error){
    const statusCode=error instanceof ApiError ? error.statusCode : 500;
    return (
      <AppErrorUI
        code={statusCode}
        message={error.message || "Failed to fetch documents"}
        backLink="/products"
        buttonName="Back to Products"
      />
    );
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No documents found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Get started by uploading your first document or refresh to check for updates.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              icon={
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              }
              onClick={handleRefresh}
              aria-label="Refresh documents"
            >
              Refresh
            </Button>
            <UploadDocumentModal productUUID={productUUID} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search documents..."
            prefix={<Search className="h-4 w-4 text-slate-400" />}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
            aria-label="Search documents"
          />
        </div>
        <div className="flex gap-2">
          <Button
            icon={
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
            }
            onClick={handleRefresh}
            aria-label="Refresh documents"
          >
            Refresh
          </Button>
          <UploadDocumentModal productUUID={productUUID} />
        </div>
      </div>

      {/* Category Filters */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Category filters"
      >
        {documentCategories.map((category: DocumentCategory, index: number) => {
          const categoryDocs =
            documentsByCategory[category.documentcategoryUUID] || [];
          const isSelected = selectedCategories.includes(
            category.documentcategoryUUID
          );

          return (
            <Button
              key={category.documentcategoryUUID}
              onClick={() => toggleCategory(category.documentcategoryUUID)}
              size="small"
              className="flex items-center gap-2"
              type={isSelected ? "primary" : "text"}
              aria-pressed={isSelected}
              aria-label={`Filter by ${category.documentcategoryName}`}
            >
              <span className="capitalize">
                {category.documentcategoryName}
              </span>
              <Badge count={categoryDocs.length} showZero color="magenta" />
            </Button>
          );
        })}
      </div>

      {/* Documents Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        layout
      >
        <AnimatePresence mode="popLayout">
          {selectedCategories.flatMap((categoryId, categoryIdx) => {
            const category = documentCategories.find(
              (c: DocumentCategory) => c.documentcategoryUUID === categoryId
            );
            const categoryDocs = documentsByCategory[categoryId] || [];

            if (!category || categoryDocs.length === 0) return [];

            const categoryIndex = documentCategories.findIndex(
              (c: DocumentCategory) => c.documentcategoryUUID === categoryId
            );
            const color = getCategoryColor(categoryIndex);

            const filteredDocs = filterDocumentsBySearch(
              categoryDocs,
              searchTerm
            );

            return filteredDocs.map((doc, docIdx) => (
              <motion.div
                key={doc.productDocumentUUID}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: docIdx * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <Card
                  variant="borderless"
                  className="group relative dark:!border-dark-border dark:!border dark:hover:!bg-slate-800/50 transition-all duration-200 h-full"
                  size="small"
                  hoverable
                >
                  <div className="flex flex-col h-full">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}
                          aria-hidden="true"
                        >
                          <FileText
                            className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`}
                          />
                        </div>
                        <Tag
                          color={color}
                          className="text-xs font-medium capitalize"
                        >
                          {category.documentcategoryName}
                        </Tag>
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0 mb-3">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate mb-1">
                        {doc.documentName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 mb-1">
                          <User className="h-3 w-3" aria-hidden="true" />
                          <span>{doc.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          <span>
                            {dayjs(doc.createdAt).format("D MMM, YYYY")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sensitive Checkbox */}
                    <div className="mb-3">
                      <Checkbox
                        checked={!doc.sensitive}
                        onChange={(e) =>
                          handleSensitiveToggle(doc, e.target.checked)
                        }
                      >
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Non-Sensitive Document
                        </span>
                      </Checkbox>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        type="text"
                        size="small"
                        icon={<Download className="h-4 w-4" />}
                        className="flex-1 text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc);
                        }}
                        aria-label={`Download ${doc.documentName}`}
                      >
                        Download
                      </Button>
                      <EditDocumentButton
                        productUUID={productUUID}
                        document={doc}
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc);
                        }}
                        loading={deletingDocId === doc.productDocumentUUID}
                        aria-label={`Delete ${doc.documentName}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ));
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State for No Categories Selected */}
      {selectedCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
            No categories selected
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Please select at least one category to view documents.
          </p>
        </div>
      )}

      {/* Empty State for Selected Categories with No Documents */}
      {selectedCategories.length > 0 &&
        selectedCategories.every((categoryId) => {
          const categoryDocs = documentsByCategory[categoryId] || [];
          const filteredDocs = filterDocumentsBySearch(
            categoryDocs,
            searchTerm
          );
          return filteredDocs.length === 0;
        }) && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {searchTerm
                ? "No documents found"
                : "No documents in selected categories"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchTerm ? (
                <>
                  No documents match your search{" "}
                  <span className="font-semibold">"{searchTerm}"</span>.
                  <br />
                  Try adjusting your search or selecting different categories.
                </>
              ) : (
                "The selected categories don't contain any documents yet. Upload documents to get started."
              )}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <UploadDocumentModal productUUID={productUUID} />
              </div>
            )}
          </div>
        )}
    </div>
  );
});

RepositoryTab.displayName = "RepositoryTab";

/**
 * Main Product Details Tabs Component
 */
export default function ProductDetailsTabs({ id }: ProductDetailsTabsProps) {
  const [accessRepository, setAccessRepository] = useState<string[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<TabType>("coverage");

  const { data: product, isLoading, error } = useProductById(id);
  const { data: deals = [], isLoading: dealsLoading } = useFetchProductDeals(
    id,
    activeTabKey === "deal"
  );

  // Tab configuration
  const tabItems = useMemo(
    () => [
      {
        key: "coverage" as const,
        label: (
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Coverage</span>
          </span>
        ),
        children: <ProductCoverageView productId={id} />,
      },
      // {
      //   key: "analytics" as const,
      //   label: (
      //     <span className="flex items-center gap-2">
      //       <BarChart3 className="h-4 w-4" aria-hidden="true" />
      //       <span className="hidden sm:inline">Analytics</span>
      //     </span>
      //   ),
      //   children: <CoverageAnalyticsTab productId={id} />,
      // },
      // {
      //   key: "recommendations" as const,
      //   label: (
      //     <span className="flex items-center gap-2">
      //       <Lightbulb className="h-4 w-4" aria-hidden="true" />
      //       <span className="hidden sm:inline">Recommendations</span>
      //     </span>
      //   ),
      //   children: <RecommendationsTab productId={id} />,
      // },
      {
        key: "documents" as const,
        label: (
          <span className="flex items-center gap-2">
            <Folder className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Documents</span>
          </span>
        ),
        children:
          accessRepository.length === 1 ? (
            <EmptyAccessRepository />
          ) : (
            <RepositoryTab productUUID={id} />
          ),
      },
      {
        key: "deal" as const,
        label: (
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Deal</span>
          </span>
        ),
        children: dealsLoading ? (
          <FullPageSkeleton />
        ) : (
          <TrackerTab
            deals={deals}
            emptyMessage="No Deals has been created for this Product."
          />
        ),
      },
    ],
    [id, accessRepository.length, dealsLoading, deals]
  );

  // Handle tab change
  const handleTabChange = useCallback((key: string) => {
    setActiveTabKey(key as TabType);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <>
        <FullPageSkeleton />
        <FullPageSkeleton />
      </>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <>
      <main>
        {/* Header Section */}
        <ProductDetailsHeader product={product} />

        {/* Tab Navigation */}
        <Card variant="borderless">
          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            items={tabItems}
            destroyOnHidden
          />
        </Card>
      </main>
      <LeadDrawer />
    </>
  );
}

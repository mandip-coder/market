"use client";

import { Product } from "@/context/store/productStore";
import { GlobalDate } from "@/Utils/helpers";

import { Badge, Button, Card, Input, Pagination, Select } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Eye,
  Loader2,
  Package,
  Plus,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, use, useCallback, useEffect, useMemo, useState } from "react";
import AddProductForm from "./AddProductForm";

// Constants
const THERAPEUTIC_AREAS = [
  "Cardiology",
  "Oncology",
  "Neurology",
  "Pulmonology",
  "Rheumatology",
  "Urology",
  "Virology",
  "Immunology",
  "Hepatology",
  "Endocrinology",
  "Vascular Medicine",
  "Dermatology",
  "Nephrology",
] as const;

const AREA_COLORS = {
  Cardiology: "red",
  Oncology: "purple",
  Neurology: "orange",
  Pulmonology: "yellow",
  Rheumatology: "pink",
  Urology: "indigo",
  Virology: "teal",
  Immunology: "blue",
  Hepatology: "violet",
  Endocrinology: "green",
  "Vascular Medicine": "gray",
  Dermatology: "blue",
  Nephrology: "blue",
} as const;

const AREA_CLASS_COLORS = {
  Cardiology: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Oncology:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Neurology:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Pulmonology:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Rheumatology:
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Urology:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  Virology: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  Immunology:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Hepatology:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  Endocrinology:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Vascular Medicine":
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  Dermatology:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Nephrology:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
} as const;

// Types
type TherapeuticArea = (typeof THERAPEUTIC_AREAS)[number];

// Utility functions

const formatPrice = (price: number | null) => {
  if (!price) return "N/A";
  return `£${price.toFixed(2)}`;
};

const getAreaColor = (area: string) =>
  AREA_COLORS[area as TherapeuticArea] || "default";
const getAreaClassColor = (area: string) =>
  AREA_CLASS_COLORS[area as TherapeuticArea] ||
  "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.95,
    transition: {
      duration: 0.5,
    },
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.8,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const ProductCard = memo(({
  product,
  handleViewDetails,
  page,
}: {
  product: Product;
  handleViewDetails: (product: Product) => void;
  page: number;
}) => {
  return (
    <motion.div
      onClick={() => handleViewDetails(product)}
      variants={cardVariants as any}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ type: "spring", stiffness: 900, damping: 15 }}
      key={`${product.productUUID}-${page}`}
      className="h-full"
    >
      <Card size="small" hoverable variant="borderless">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Package className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                  {product.productName}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {product.productCode}
                </span>
              </div>
            </div>

            {product.therapeuticArea && (
              <span
                className={`flex-shrink-0 text-xs px-2 py-1 rounded font-medium ${getAreaClassColor(
                  product.therapeuticArea
                )}`}
              >
                {product.therapeuticArea}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            {product.updatedAt && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">
                    Last Updated
                  </span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  {GlobalDate(product.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
ProductCard.displayName = "ProductCard";
interface ProductPromise {
  response: Promise<{
    data: Product[];
  }>;
}
// Main Component
export default function ProductsListing({ response }: ProductPromise) {
  const dataResponse = use(response);
  const Products = dataResponse.data;
  const [products, setProducts] = useState<Product[]>(Products as Product[]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] =
    useState<string>("");
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const itemsPerPage = 10

  // Fetch data
  useEffect(() => {
    setLoading(true);
    try {
      // Apply filters
      let filteredData = Products as Product[];

      // Filter by search query
      if (searchQuery) {
        filteredData = filteredData.filter(
          (product) =>
            product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.productCode?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (therapeuticAreaFilter) {
        filteredData = filteredData.filter(
          (product) => product.therapeuticArea === therapeuticAreaFilter
        );
      }

      setProducts(filteredData);
      setPage(1);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, therapeuticAreaFilter]);

  // Memoized calculations
  const { totalPages, currentProducts } = useMemo(() => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentProducts = products.slice(
      startIndex,
      startIndex + itemsPerPage
    );
    return { totalPages, currentProducts };
  }, [products, page, itemsPerPage]);

  // Event handlers
  const handleViewDetails = useCallback((product: Product) => {
    router.push(`/products/${product.productUUID}`);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);



  return (
    <>
      <main className="w-full">
        {/* Filters */}
        <div className="flex flex-col  sm:flex-row gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search products by name or code..."
            value={searchQuery}
            className="w-full max-w-[500px]"
            prefix={<Search className="h-4 w-4 text-slate-400" />}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            value={therapeuticAreaFilter || "Therapeutic Area"}
            onChange={(value) =>
              setTherapeuticAreaFilter(value === "Therapeutic Area" ? "" : value)
            }
            className="w-full max-w-[200px]"
            allowClear
            showSearch
            options={THERAPEUTIC_AREAS.map((area) => ({
              value: area,
              label: area,
            }))}
          />
          <div className="ml-auto">
            {!loading && totalPages > 1 && (
              <Pagination
                current={page}
                total={products.length}
                pageSize={itemsPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total} items`}
              />
            )}
          </div>
        </div>

          {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : products.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                key={`${page}-${therapeuticAreaFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentProducts.map((product, index) => (
                  <ProductCard
                    key={`${product.productUUID}-${page}`}
                    product={product}
                    handleViewDetails={handleViewDetails}
                    page={page}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-6">
              <Package className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              No products found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
              Try adjusting your search or filters, or add a new product to get
              started
            </p>
            <Button
              type="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Add New Product
            </Button>
          </motion.div>
        )}
      </main>

      <AddProductForm />
    </>
  );
}

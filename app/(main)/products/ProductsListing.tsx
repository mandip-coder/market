"use client";

import PageHeading from '@/components/PageHeading/PageHeading';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Button, Card, Input, Select } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronLeft, ChevronRight, ClipboardCheck, Clock, DollarSign, Eye, Loader2, Package, Plus, Search, Server } from "lucide-react";
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useState } from "react";
import AddProductForm from "./AddProductForm";
import { Product } from '@/context/store/productStore';



// Constants
const THERAPEUTIC_AREAS = [
  "Cardiology",
  "Oncology",
  "Diabetes",
  "Respiratory",
  "Neurology"
] as const;

const AREA_COLORS = {
  'Cardiology': 'red',
  'Oncology': 'purple',
  'Diabetes': 'green',
  'Respiratory': 'blue',
  'Neurology': 'orange',
} as const;

const AREA_CLASS_COLORS = {
  'Cardiology': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Oncology': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Diabetes': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Respiratory': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Neurology': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
} as const;

// Types
type TherapeuticArea = typeof THERAPEUTIC_AREAS[number];

// Utility functions
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: '2-digit',
    minute: '2-digit'
  });

const formatPrice = (price: number | null) => {
  if (!price) return "N/A";
  return `£${price.toFixed(2)}`;
};

const getAreaColor = (area: string) => AREA_COLORS[area as TherapeuticArea] || 'default';
const getAreaClassColor = (area: string) => AREA_CLASS_COLORS[area as TherapeuticArea] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.95,
    transition: {
      duration: 0.5
    }
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
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};


const ProductCard = ({ product, handleViewDetails, index, page }: {
  product: Product;
  handleViewDetails: (product: Product) => void;
  index: number;
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
      {/* <Card
      size='small'
      hoverable
      variant='borderless'
      >
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
              <span className={`flex-shrink-0 text-xs px-2 py-1 rounded font-medium ${getAreaClassColor(product.therapeuticArea)}`}>
                {product.therapeuticArea}
              </span>
            )}
          </div>
        </div>

          <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">List Price</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatPrice(product.pr)}
            </p>
          </div>

          <div className="space-y-2">
            {product.lastSyncAt && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">Last Sync</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatDate(product.lastSyncAt)}
                </span>
              </div>
            )}

            {product.sourceErpId && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">ERP ID</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white font-mono truncate max-w-[120px]">
                  {product.sourceErpId}
                </span>
              </div>
            )}
          </div>
        </div>

        {product.maMetadata && typeof product.maMetadata === 'object' && 
         (product.maMetadata.nice_approved || product.maMetadata.formulary_status) && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 flex-wrap">
              {product.maMetadata.nice_approved && (
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">NICE</span>
                </div>
              )}
              {product.maMetadata.formulary_status && (
                <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  <ClipboardCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                    {product.maMetadata.formulary_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
      </Card> */}
    </motion.div>
  );
};
// Main Component
export default function ProductsListing({productsPromise}: {productsPromise: Promise<Product[]>}) {
  const Products=use(productsPromise)
  const [products, setProducts] = useState<Product[]>(Products as Product[]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router=useRouter()
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sorter: {},
  });

  const itemsPerPage = viewMode === 'grid' ? 20 : 10;

  // Fetch data
  useEffect(() => {
    setLoading(true);
    try {
      // Apply filters
      let filteredData = Products as Product[];


      if (therapeuticAreaFilter) {
        filteredData = filteredData.filter(product => product.therapeuticArea === therapeuticAreaFilter);
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
    const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);
    return { totalPages, currentProducts };
  }, [products, page, itemsPerPage]);

  // Event handlers
  const handleViewDetails = useCallback((product: Product) => {
    router.push(`/products/${product.productUUID}`);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'table' : 'grid');
    setPage(1);
  }, []);

  const handleTableChange = useCallback((pagination: any, filters: any, sorter: any) => {
    setTableParams({
      pagination,
      filters,
      sorter,
    });
  }, []);

  const handleDrawerClose = () => setIsDrawerOpen(false);

  // Table columns
  const columns: ProColumns<Product>[] = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
            <Package className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-medium text-sm">#{text}</span>
        </div>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: true,
      render: (text) => (
        <div className="font-medium">{text}</div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: true,
      render: (text) => (
        <div className="font-medium">{text}</div>
      ),
    },
    {
      title: 'Therapeutic Area',
      dataIndex: 'therapeuticArea',
      key: 'therapeuticArea',
      width: 150,
      filters: true,
      valueEnum: THERAPEUTIC_AREAS.reduce((acc, area) => {
        acc[area] = { text: area };
        return acc;
      }, {} as Record<string, { text: string }>),
      render: (text) => text ? (
        <Badge color={getAreaColor(text as string)}>
          {text}
        </Badge>
      ) : (
        <span className="text-xs text-slate-400">Not set</span>
      ),
    },
    {
      title: 'List Price',
      dataIndex: 'listPrice',
      key: 'listPrice',
      width: 120,
      sorter: true,
      render: (text) => (
        <div className="font-medium">{formatPrice(text as number)}</div>
      ),
    },
    {
      title: 'Last Sync',
      dataIndex: 'lastSyncAt',
      key: 'lastSyncAt',
      width: 120,
      sorter: true,
      render: (text) => text ? (
        <div className="text-sm">{formatDate(text as string)}</div>
      ) : (
        <span className="text-xs text-slate-400">Never</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<Eye className="h-3.5 w-3.5" />}
          onClick={() => handleViewDetails(record)}
        />
      ),
    },
  ], [handleViewDetails]);

  return (
    <>
      <main className="w-full">
        <PageHeading
          title="Product Catalogue"
          descriptionLine="Browse and manage pharmaceutical products"/>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search products by name or code..."
            value={searchQuery}
            prefix={<Search className="h-4 w-4 text-slate-400" />}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            value={therapeuticAreaFilter || "all"}
            onChange={(value) => setTherapeuticAreaFilter(value === "all" ? "" : value)}
            className='w-full max-w-[200px]'
            options={THERAPEUTIC_AREAS.map(area => ({ value: area, label: area }))}
          />
        </div>

        {/* Product Count and Pagination - Only for Grid View */}
        {viewMode === 'grid' && (
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {loading ? "Loading..." : `Showing ${currentProducts.length} of ${products.length} products`}
            </p>

            {!loading && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  icon={<ChevronLeft className="h-4 w-4" />}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  icon={<ChevronRight className="h-4 w-4" />}
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                />
              </div>
            )}
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : products.length > 0 ? (
          viewMode === 'grid' ? (
            <AnimatePresence mode="wait">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                key={`${page}-${therapeuticAreaFilter}-${searchQuery}`}
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
                    index={index}
                    page={page}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <ProTable<Product>
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={{
                current: tableParams.pagination.current,
                pageSize: tableParams.pagination.pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showQuickJumper: true,
              }}
              onChange={handleTableChange}
              search={false}
              options={{
                density: true,
                fullScreen: true,
                reload: () => setProducts(products),
                setting: true,
              }}
              scroll={{ x: 800 }}
              dateFormatter="string"
              headerTitle={false}
            />
          )
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
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No products found</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
              Try adjusting your search or filters, or add a new product to get started
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
'use client'

import { useTopProductsQuery } from '@/app/(main)/dashboard/services/dashboard.hooks'
import { ProductSkeleton } from '@/components/Skeletons/ProductCardSkelton'
import { Badge, Tag } from 'antd'
import { Package } from 'lucide-react'
import Link from 'next/link'

export default function TopProductsUI() {
  const { data: products, isLoading, isError, error } = useTopProductsQuery()

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </>
    )
  }

  if (isError) {
    return (
      <div className="col-span-full text-center py-8 text-red-500">
        Failed to load products: {error?.message}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        No products found
      </div>
    )
  }

  return (
    <>
      {products.slice(0, 8).map(({
        productUUID,
        productName,
        productCode,
        totalCount,
        therapeuticArea,
      }) => (
        <Link href={`/products/${productUUID}`} key={productUUID}>
          <div className="border-0 shadow-sm hover:shadow transition-all duration-300 bg-white dark:bg-gray-900/50 h-full rounded-lg p-4 group">
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge color="blue" count={totalCount} />
            </div>

            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {productName}
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 truncate">
              {productCode}
            </p>

            {therapeuticArea && (
              <Tag color="blue">{therapeuticArea}</Tag>
            )}
          </div>
        </Link>
      ))}
    </>
  )
}

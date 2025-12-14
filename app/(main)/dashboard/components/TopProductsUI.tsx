import { Badge, Tag } from 'antd';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
interface TopProducts {
  productUUID: string | number;
  productName: string;
  productCode: string;
  dealCount: number;
  therapeuticArea?: string;
}
interface Products{
  data:TopProducts[]
}
interface TopProductsUIProps {
  response: Promise<Products>;
}

export default function TopProductsUI({ response }: TopProductsUIProps) {
  const responseData = use(response);
  const products=responseData.data
  if (!products || products.length === 0) return null;

  return (
    <>
      {products.slice(0, 8).map((product) => {
        return (
          <Link href={`/products/${product.productUUID}`} key={product.productUUID}>
            <div className="border-0 shadow-sm hover:shadow transition-all duration-300 bg-white dark:bg-gray-900/50 h-full rounded-lg p-4 group">
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge color="blue" count={product.dealCount} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {product.productName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 truncate">
                {product.productCode}
              </p>
              {product.therapeuticArea && (
                <Tag color="blue" >
                  {product.therapeuticArea}
                </Tag>
              )}
            </div>
          </Link>
        );
      })}
    </>
  )
}

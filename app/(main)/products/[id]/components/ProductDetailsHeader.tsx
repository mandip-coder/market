import { GlobalDate } from "@/Utils/helpers";
import { Tag } from "antd";
import Title from "antd/es/typography/Title";
import { Activity, Clock } from "lucide-react";
import { Product } from "../../services/types";

export default function ProductDetailsHeader({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="mb-6">
 

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-between w-full">
          <div className="flex items-center gap-3">
            <Title
              level={2}
              className="!mb-0 !text-2xl font-bold text-gray-900 dark:text-gray-100"
            >
              {product.productName}
            </Title>
            {product.status && (
              <Tag
                color={product.status === "active" ? "success" : "default"}
                className="rounded-full px-3 capitalize font-medium"
              >
                {product.status}
              </Tag>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Activity
                  className="h-4 w-4 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">
                  {product.therapeuticArea}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-6 border-l border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <Clock
                  className="h-4 w-4 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-2">
                  <span className="hidden lg:inline text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    Updated:
                  </span>
                  <span className="text-sm font-medium">
                    {GlobalDate(product.updatedAt)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

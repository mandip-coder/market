'use client'
import { Skeleton } from "antd"

export function ProductSkeleton (){
  return <div className="border-0 shadow-sm bg-white dark:bg-gray-900/50 h-full rounded-lg p-4">
    <div className="flex items-start justify-between mb-2">
      <Skeleton.Avatar active size={16} />
      <Skeleton.Button active size="small" />
    </div>
    <Skeleton active title={{ width: '100%' }} paragraph={{ rows: 1, width: '80%' }} className="mb-1.5" />
    <Skeleton.Button active size="small" />
  </div>

}
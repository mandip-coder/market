'use client'
import { Deal } from '@/app/(main)/deals/services/deals.types'
import { useLoginUser } from '@/hooks/useToken'
import { formatUserDisplay, GlobalDate } from '@/Utils/helpers'
import { Button } from 'antd'
import { ArrowLeft, Building2, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useCallback } from 'react'
interface headerDetails {
  dealData: Deal
}
function DealDetailsHeader({ dealData }: headerDetails) {
  const router = useRouter();
  const handleBack = useCallback(() => {
    router.push('/deals');
  }, [router]);
 
  const userUUID=useLoginUser()?.userUUID

  return (
    <div className="mb-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-3 relative overflow-hidden">


      {/* Main content */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="flex-grow">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {dealData.dealName}
            </h1>
            <div className="flex gap-2 items-center text-md text-gray-600 dark:text-gray-400 mt-0.5">
              <span><Building2 size={18} /></span>
              <span>{dealData.hcoName}</span>
            </div>
          </div>
          <Button
            type="default"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

        </div>

        {/* Information grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Created On</p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {GlobalDate(dealData.createdAt)} by {formatUserDisplay(dealData.createdBy,dealData.createdUUID,userUUID)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Last Updated</p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {GlobalDate(dealData.updatedAt)} by {formatUserDisplay(dealData.updatedBy,dealData.updatedUUID,userUUID)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary section */}
        {dealData.summary && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-2 border-blue-500">
            <p className="text-xs text-gray-700 dark:text-gray-300 italic">
              "{dealData.summary}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
export default memo(DealDetailsHeader)

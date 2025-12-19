'use client'
import { GlobalDate } from '@/Utils/helpers'
import { Button } from 'antd'
import { ArrowLeft, Building2, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useCallback } from 'react'

interface Healthcare {
  id: string;
  icbId: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export default function HealthCareDetailsHeader({ headerDetails }: { headerDetails:Healthcare }) {
  const healthcare =headerDetails
  const router = useRouter();
  const handleBack = useCallback(() => {
    router.push('/healthcares');
  }, [router]);
  return (
    <div className="mb-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-3 relative overflow-hidden">


      {/* Main content */}
      <div className="flex flex-col gap-2">
        {/* Title with decorative element */}
        <div className="flex items-start gap-2">
          <div className="flex-grow">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {healthcare.name}
            </h1>
            <div className="flex gap-2 items-center text-md text-gray-600 dark:text-gray-400 mt-0.5">
              <span><Building2 size={18} /></span>
              <span>{healthcare.type}</span>
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
                {GlobalDate(healthcare.createdAt)} by {healthcare.createdBy}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Last Updated</p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
               {GlobalDate(healthcare.updatedAt)} by {healthcare.updatedBy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { ProductSkeleton } from '@/components/Skeletons/ProductCardSkelton'
import StageSkeleton from '@/components/Skeletons/StageSkeleton'
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry'
import { ChevronRight, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import DealStagesUI from './components/DealStagesUI'
import KPICardsUI from './components/KPICardsUI'
import QuickActions from './components/QuickActions'
import TopProductsUI from './components/TopProductsUI'
import { SERVERAPI } from '@/Utils/apiFunctions'
import { APIPATH } from '@/shared/constants/url'

export default async function Dashboard() {

  const kpiStatsData = SERVERAPI(APIPATH.DASHBOARD.KPIDATA)
  const topProductsData = SERVERAPI(APIPATH.DASHBOARD.TOPPRODUCTS)
  const dealStagesData = SERVERAPI(APIPATH.DASHBOARD.STAGECOUNTS)

  return (
    <main className="w-full">
      <div className="space-y-6">
        {/* KPI Cards Section */}
        <SuspenseWithBoundary>
          <KPICardsUI response={kpiStatsData} />
        </SuspenseWithBoundary>

        {/* Top Products Section */}
        <div className="border-0 shadow bg-white dark:bg-black rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package color="#C53E91" size={20} />
              Top Products
            </h2>
            <Link
              href="/products"
              className="group inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              View All
              <ChevronRight
                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SuspenseWithBoundary loading={
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </>
            }>
              <TopProductsUI response={topProductsData} />
            </SuspenseWithBoundary>
          </div>
        </div>

        {/* Quick Actions and Deal Stages Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <SuspenseWithBoundary>
            <QuickActions />
          </SuspenseWithBoundary>
          <div className="border-0 shadow-lg bg-white dark:bg-black rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Deal Stages
            </h2>
            <div className="space-y-0">
              <SuspenseWithBoundary loading={
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <StageSkeleton key={index} />
                  ))}
                </div>
              }>
                <DealStagesUI response={dealStagesData} />
              </SuspenseWithBoundary>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

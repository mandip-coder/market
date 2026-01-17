import { ChevronRight, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import QuickActions from "./components/QuickActions";
import KPICardsUI from "./components/KPICardsUI";
import DealStagesUI from "./components/DealStagesUI";
import TopProductsUI from "./components/TopProductsUI";
import LeadFollowupsWidget from "./components/LeadFollowupsWidget";
import DealFollowupsWidget from "./components/DealFollowupsWidget";

export default function Dashboard() {
  return (
    <main className="w-full">
      <div className="space-y-6">
        <KPICardsUI />

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <div className="border-0 shadow bg-white dark:bg-black rounded-xl p-5 col-span-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2  gap-3">
              <TopProductsUI />
            </div>
          </div>
          <div className="border-0 shadow-lg bg-white dark:bg-black rounded-xl p-5 col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Deal Stages
            </h2>
            <div className="space-y-0">
              <DealStagesUI />
            </div>
          </div>
          <div className="col-span-2">
          <QuickActions />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadFollowupsWidget />
          <DealFollowupsWidget />
        </div>
      </div>
    </main>
  );
}

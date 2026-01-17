import DataTableSkeleton from "@/components/Skeletons/DataTableSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import CompanyDataTable from "./components/CompanyDataTable";
import CompanyHeader from "./components/CompanyHeader";


export default async function page() {
  
  return (<>
    <CompanyHeader />
    <SuspenseWithBoundary loading={<DataTableSkeleton />}>
      <CompanyDataTable />
    </SuspenseWithBoundary>
  </>
  )
}

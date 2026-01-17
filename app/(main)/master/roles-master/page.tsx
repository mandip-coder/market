import DataTableSkeleton from "@/components/Skeletons/DataTableSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import RoleDataTable from "./components/RoleDataTable";
import RolesHeader from "./components/RolesHeader";


export default async function page() {
  return (<>
    <RolesHeader />
    <SuspenseWithBoundary loading={<DataTableSkeleton />}>
      <RoleDataTable  />
    </SuspenseWithBoundary>
  </>
  )
}

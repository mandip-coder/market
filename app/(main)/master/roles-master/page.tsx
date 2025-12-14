import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import DataTableSkeleton from "@/components/Skeletons/DataTableSkeleton";
import { SERVERAPI } from "@/Utils/apiFunctions";
import { APIPATH } from "@/shared/constants/url";
import RolesHeader from "./components/RolesHeader";
import RoleDataTable from "./components/RoleDataTable";


export default async function page() {
  const dataPromise = SERVERAPI(APIPATH.ROLES.GETROLES);
  return (<>
    <RolesHeader />
    <SuspenseWithBoundary loading={<DataTableSkeleton />}>
      <RoleDataTable tableData={dataPromise} />
    </SuspenseWithBoundary>
  </>
  )
}

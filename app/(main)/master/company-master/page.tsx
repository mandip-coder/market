import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import DataTableSkeleton from "@/components/Skeletons/DataTableSkeleton";
import CompanyHeader from "./components/CompanyHeader";
import CompanyDataTable from "./components/CompanyDataTable";
import { SERVERAPI } from "@/Utils/apiFunctions";
import { APIPATH } from "@/shared/constants/url";


export default async function page() {
  const dataPromise =SERVERAPI(APIPATH.COMPANY.GETCOMPANIES);
  const rolesPromise =SERVERAPI(APIPATH.ROLES.GETROLES);
  const productsPromise =SERVERAPI(APIPATH.PRODUCTS.GETPRODUCTS);
  
  return (<>
    <CompanyHeader />
    <SuspenseWithBoundary loading={<DataTableSkeleton />}>
      <CompanyDataTable tableData={dataPromise } />
    </SuspenseWithBoundary>
  </>
  )
}

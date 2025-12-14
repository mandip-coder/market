import DataTableSkeleton from "@/components/Skeletons/DataTableSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import { APIPATH } from "@/shared/constants/url";
import { SERVERAPI } from "@/Utils/apiFunctions";
import ProductDataTable from "./components/ProductDataTable";
import ProductHeader from "./components/ProductHeader";

export default async function ProductMaster() {
  const dataPromise = SERVERAPI(APIPATH.PRODUCTS.GETPRODUCTS);

  return (
    <>
      <ProductHeader />
      <SuspenseWithBoundary loading={<DataTableSkeleton />}>
        <ProductDataTable tableData={dataPromise} />
      </SuspenseWithBoundary>
    </>
  );
}

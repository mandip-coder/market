import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import ProductDataTable from "./components/ProductDataTable";
import ProductHeader from "./components/ProductHeader";

export default async function ProductMaster() {
  return (
    <>
      <ProductHeader />
      <SuspenseWithBoundary>
        <ProductDataTable />
      </SuspenseWithBoundary>
    </>
  );
}

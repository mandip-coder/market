import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import ProductsListing from "./ProductsListing";
import PageHeading from "@/components/PageHeading/PageHeading";
export default async function page() {

  return (
    <>
      <PageHeading
        title="Product Catalogue"
        descriptionLine="Browse and manage pharmaceutical products"
      />
      <SuspenseWithBoundary loading={<FullPageSkeleton />}>
        <ProductsListing  />
      </SuspenseWithBoundary>
    </>
  );
}

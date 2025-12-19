import React from "react";
import Products from "./products.json";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import ProductsListing from "./ProductsListing";
import { SERVERAPI } from "@/Utils/apiFunctions";
import { APIPATH } from "@/shared/constants/url";
import PageHeading from "@/components/PageHeading/PageHeading";
export default async function page() {
  const products = SERVERAPI(APIPATH.PRODUCTS.GETPRODUCTS);

  return (
    <>
      <PageHeading
        title="Product Catalogue"
        descriptionLine="Browse and manage pharmaceutical products"
      />
      <SuspenseWithBoundary loading={<FullPageSkeleton />}>
        <ProductsListing response={products} />
      </SuspenseWithBoundary>
    </>
  );
}

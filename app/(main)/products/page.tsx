import React from 'react'
import Products from "./products.json";
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry'
import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton';
import ProductsListing from './ProductsListing';
export default async function page() {
  const data = new Promise<any>((resolve) => {
    setTimeout(() => resolve(Products), 2000)
  })


  return (
    <SuspenseWithBoundary loading={<FullPageSkeleton/>}>
      <ProductsListing productsPromise={data} />
    </SuspenseWithBoundary>
  )
}

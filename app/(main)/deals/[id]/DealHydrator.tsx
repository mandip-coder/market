'use client';
import { useDealStore } from "@/context/store/dealsStore";
import { Product } from "@/context/store/productStore";
import { use, useEffect } from "react";

interface DealHydratorProps {
  productsPromise: Promise<{
    data: Product[]
  }>
  dealProductPromise: Promise<{
    data: Product[]
  }>
}

export default function DealHydrator({ productsPromise, dealProductPromise }: DealHydratorProps) {
  const { setProductList, setSelectedProducts } = useDealStore();
  const productsData = use(productsPromise);
  const dealProductData = use(dealProductPromise);
  useEffect(() => {
    setProductList(productsData.data);
    setSelectedProducts(dealProductData.data);
  }, []);

  return null;
}

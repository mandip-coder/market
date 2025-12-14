import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import DealDetails from "./DealDetails";
import DealDetailsHeader from "./DealDetailsHeader";
import { APIPATH } from "@/shared/constants/url";
import { SERVERAPI } from "@/Utils/apiFunctions";
import DealHydrator from "./DealHydrator";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headerData = SERVERAPI(APIPATH.DEAL.GETDEAL + id);
  const productsData = SERVERAPI(APIPATH.PRODUCTS.GETPRODUCTS);
  const fetchDealProducts = SERVERAPI(APIPATH.DEAL.GETPRODUCTS(id));

  return (
    <SuspenseWithBoundary loading={<FullPageSkeleton />}>
      <DealHydrator productsPromise={productsData} dealProductPromise={fetchDealProducts} />
      <DealDetailsHeader deal={headerData} />
      <DealDetails dealDetailsPromise={headerData} />
    </SuspenseWithBoundary>
  );
}

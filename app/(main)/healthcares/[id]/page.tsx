import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import { APIPATH } from "@/shared/constants/url";
import { SERVERAPI } from "@/Utils/apiFunctions";
import HealthCareDetails from "./HealthCareDetails";
import HealthCareDetailsHeader from "./HealthCareDetailsHeader";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = SERVERAPI(APIPATH.HCO.GETHEALTHCARE + id);
  const headerData = SERVERAPI(APIPATH.HCO.GETHEALTHCARE + id);
  
  return (
    <>
      <SuspenseWithBoundary loading={<FullPageSkeleton />}>
        <HealthCareDetailsHeader headerDetails={headerData} />
      </SuspenseWithBoundary>
      <SuspenseWithBoundary loading={<FullPageSkeleton />}>
        <HealthCareDetails healthcareDetailsPromise={response} />
      </SuspenseWithBoundary>
    </>
  );
}

import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import { APIPATH } from "@/shared/constants/url";
import { SERVERAPI } from "@/Utils/apiFunctions";
import HealthCareDetails from "./HealthCareDetails";
import HealthCareDetailsHeader from "./HealthCareDetailsHeader";
import { Healthcare } from "../lib/types";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // const response = SERVERAPI(APIPATH.HCO.GETHEALTHCARE + id);
  // const headerData = SERVERAPI(APIPATH.HCO.GETHEALTHCARE + id);

  const headerData = {
    id: "",
    icbId: "1234569",
    name: "Appollo Hospital",
    type: "NHS",
    address: "123 Main St, City",
    phone: "123-456-7890",
    website: "https://www.apollohospital.com",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    createdBy: "Jayesh Patel",
    updatedBy: "Jayesh Patel",
  };
  const response = {
    data: {
     hcoUUID: "",
       icbId: "",
       hcoName: "Appollo Hospital",
       hcoType: "NHS",
       address: "123 Main St, City",
       phone1: "123-456-7890",
       phone2: "123-456-7890",
       email: "apollohospital@gmail.com",
       website: "https://www.apollohospital.com",
       ragRating: "amber",
       createdAt: "2023-01-01",
       updatedAt: "2023-01-01",
       contacts: []

    },
  };
  return (
    <>
      <SuspenseWithBoundary loading={<FullPageSkeleton />}>
        <HealthCareDetailsHeader headerDetails={headerData} />
      </SuspenseWithBoundary>
      <SuspenseWithBoundary loading={<FullPageSkeleton />}>
        <HealthCareDetails healthcareDetailsPromise={response as any} />
      </SuspenseWithBoundary>
    </>
  );
}

import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import DealDetails from "./DealDetails";
import DealDetailsHeader from "./DealDetailsHeader";
import { APIPATH } from "@/shared/constants/url";
import { SERVERAPI } from "@/Utils/apiFunctions";
import DealHydrator from "./DealHydrator";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id.length !== 36) {
    return (
      <AppErrorUI
        code={404}
        message={"Deal not Found"}
        backLink="/deals"
        buttonName="Back to Deals"
      />
    );
  }
  let headerData;
  try {
    headerData = await SERVERAPI(APIPATH.DEAL.GETDEAL + id);
    if (!headerData.status) {
      return (
        <AppErrorUI
          code={headerData.statusCode}
          message={headerData.message}
          backLink="/deals"
          buttonName="Back to Deals"
        />
      );
    }
    
  } catch (error:any) {
    return (
      <AppErrorUI
        code={500}
        message={error.message}
        backLink="/deals"
        buttonName="Back to Deals"
      />
    );
  }
  
  const productsData = SERVERAPI(APIPATH.PRODUCTS.GETPRODUCTS);
  const fetchDealProducts = SERVERAPI(APIPATH.DEAL.GETPRODUCTS(id));
  const contactPersonsData = SERVERAPI(APIPATH.HCO.CONTACTPERSONS(headerData.data.hcoUUID));
  const followUpsData = SERVERAPI(APIPATH.DEAL.TABS.FOLLOWUP.GETALLFOLLOWUP + id);
  const callsData = SERVERAPI(APIPATH.DEAL.TABS.CALL.GETALLCALL + id);
  const notesData = SERVERAPI(APIPATH.DEAL.TABS.NOTES.GETALLNOTES + id);
  const meetingsData = SERVERAPI(APIPATH.DEAL.TABS.MEETING.GETALLMEETING + id);
  const emailsData = SERVERAPI(APIPATH.DEAL.TABS.EMAIL.GETALLEMAIL(id));
  return (
    <SuspenseWithBoundary loading={<FullPageSkeleton />}>
      <DealHydrator
        productsPromise={productsData}
        dealProductPromise={fetchDealProducts}
        contactPersonsPromise={contactPersonsData}
        followUpsPromise={followUpsData}
        callsPromise={callsData}
        notesPromise={notesData}  
        meetingsPromise={meetingsData}
        emailsPromise={emailsData}
      />
      <DealDetailsHeader deal={headerData} />
      <DealDetails dealDetails={headerData} />
    </SuspenseWithBoundary>
  );
}

import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import LeadDetails from "./LeadDetails";
import LeadDetailsHeader from "./LeadDetailsHeader";
import { SERVERAPI } from "@/Utils/apiFunctions";
import { APIPATH } from "@/shared/constants/url";
import LeadHydrator from "./LeadHydrator";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let headerData;
  if(id.length!==36){
    return <AppErrorUI code={404} message={"Lead not Found"} backLink="/leads" buttonName="Back to Leads" />
  }
  
  try {
    headerData =await SERVERAPI(APIPATH.LEAD.GETLEAD + id);
    if(!headerData.status){
      return <AppErrorUI code={headerData.statusCode} message={headerData.message} />
    }
    
  } catch (error) {
    return <AppErrorUI code={500} message={"Something went wrong"} />
    
  }
  
  const followUpsData = SERVERAPI(APIPATH.LEAD.TABS.FOLLOWUP.GETALLFOLLOWUP + id);
  const callsData = SERVERAPI(APIPATH.LEAD.TABS.CALL.GETALLCALL + id);
  const emailsData = SERVERAPI(APIPATH.LEAD.TABS.EMAIL.GETALLEMAIL(id));
  return (
    <SuspenseWithBoundary>
      <LeadHydrator followUpsPromise={followUpsData} callsPromise={callsData} emailsPromise={emailsData}/>
      <LeadDetailsHeader headerDetails={headerData} />
      <LeadDetails lead={headerData} />
    </SuspenseWithBoundary>
  )
}

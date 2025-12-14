import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import LeadDetails from "./LeadDetails";
import LeadDetailsHeader from "./LeadDetailsHeader";
import { SERVERAPI } from "@/Utils/apiFunctions";
import { APIPATH } from "@/shared/constants/url";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const headerData = SERVERAPI(APIPATH.LEAD.GETLEAD + id)
  return (
    <SuspenseWithBoundary>
      <LeadDetailsHeader headerDetails={headerData} />
      <LeadDetails lead={headerData} />
    </SuspenseWithBoundary>
  )
}

import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import LeadDetails from "./LeadDetails";
import LeadDetailsHeader from "./LeadDetailsHeader";
import LeadsData from "../../leadsData.json";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headerData = new Promise<any>((resolve, reject) => {
    const leadData = LeadsData.find((lead: any) => lead.leadUUID === id)
    setTimeout(() => resolve(leadData), 2000)
  })
  return (
    <SuspenseWithBoundary>
      <LeadDetailsHeader headerDetails={headerData} />
      <LeadDetails data={headerData} />
    </SuspenseWithBoundary>
  )
}
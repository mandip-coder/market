// app/dashboard/layout.tsx

import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import TabsLayout from "./TabsLayout";
import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import LeadsHeader from "../components/LeadsHeader";

export default async function LeadsLayout({
  leadListing,
  recommendations
}: {
  leadListing: React.ReactNode;
  recommendations: React.ReactNode;
}) {
  return <>
    <LeadsHeader />
    <SuspenseWithBoundary loading={<FullPageSkeleton />}>
      <TabsLayout  leadListing={leadListing} recommendations={recommendations} />
    </SuspenseWithBoundary>
  </>
}

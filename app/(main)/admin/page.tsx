import PageHeading from "@/components/PageHeading/PageHeading";
import AnalyticsOverview from "./components/AnalyticsOverview";

export default function page() {
  return (
    <>
      <PageHeading title="Analytics Overview" descriptionLine="Detailed analytics overview of the system and business" />
      <AnalyticsOverview />
    </>
  )
}

import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import DealDetailsClient from "./DealDetailsClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validate ID format
  if (id.length !== 36) {
    return <AppErrorUI code={400} message={"Invalid Page Request"} backLink="/deals" buttonName="Back to Deals" />
  }


  return (
    <DealDetailsClient id={id} />
  )
}

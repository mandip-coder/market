import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate ID format
  // if (id.length !== 36) {
  //   return <AppErrorUI code={400} message="Invalid Page Request" backLink="/user-management" buttonName="Back to Users" />
  // }

  return (
    <></>
  )
}

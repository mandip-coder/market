import DataTableSkeleton from "@/components/Skeletons/DataTableSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import UserDataTable from "./components/UserDataTable";
import UserHeader from "./components/UserHeader";

export default async function page() {
  return (
    <>
      <UserHeader />
      <SuspenseWithBoundary loading={<DataTableSkeleton />}>
        <UserDataTable />
      </SuspenseWithBoundary>
    </>
  );
}

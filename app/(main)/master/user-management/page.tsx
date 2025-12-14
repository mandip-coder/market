import DataTableSkeleton from "@/components/Skeletons/DataTableSkeleton";
import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import { APIPATH } from "@/shared/constants/url";
import { SERVERAPI } from "@/Utils/apiFunctions";
import UserDataTable from "./components/UserDataTable";
import UserHeader from "./components/UserHeader";

export default async function page() {
  const users =  SERVERAPI(APIPATH.USERS.GETUSERS);
  const companyList = SERVERAPI(APIPATH.COMPANY.GETCOMPANIES)
  const countryList = SERVERAPI(APIPATH.DROPDOWN_MODULE.HCO)
  return (
    <>
      <UserHeader />
      <SuspenseWithBoundary loading={<DataTableSkeleton />}>
        <UserDataTable usersData={users} companyList={companyList} countryList={countryList} />
      </SuspenseWithBoundary>
    </>
  );
}

import { SERVERAPI } from '@/Utils/apiFunctions';
import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';
import { APIPATH } from '@/shared/constants/url';
import DealsHeader from './components/DealsHeader';
import DealsListing from './components/DealsListing';

export default async function DealsPage() {
  const data = SERVERAPI(APIPATH.DEAL.GETALLDEALS)
  const hcoList = SERVERAPI(APIPATH.DROPDOWN_MODULE.HCO)
  return (<>
    <DealsHeader />
    <SuspenseWithBoundary loading={<FullPageSkeleton />}>
      <DealsListing dealPromise={data} hcoListPromise={hcoList} />
    </SuspenseWithBoundary>
  </>)
}

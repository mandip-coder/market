import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';
import HelathCaresData from "../deals/healthcares.json";
import HealthCareHeader from './components/HealthCareHeader';
import HelathcareListing from './components/HealthCareListing';
import { SERVERAPI } from '@/Utils/apiFunctions';
import { APIPATH } from '@/shared/constants/url';
export default async function page() {
  const data = new Promise<any>((resolve) => {
    setTimeout(() => resolve(HelathCaresData), 2000)
  })
  const hcoData=SERVERAPI(APIPATH.HCO.GETHEALTHCARES)
  return (<>
    <HealthCareHeader />
    <SuspenseWithBoundary loading={<FullPageSkeleton />}>
      <HelathcareListing dataPromise={data} />
    </SuspenseWithBoundary>
  </>
  )
}

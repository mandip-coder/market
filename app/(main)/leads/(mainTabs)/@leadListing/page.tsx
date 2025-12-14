import { SERVERAPI } from '@/Utils/apiFunctions';
import LeadsLising from '../../components/LeadsListing';
import { APIPATH } from '@/shared/constants/url';

export default async function LeadListingPage() {
  const data = SERVERAPI(APIPATH.LEAD.GETALLLEADS)
  return (
    <LeadsLising leadPromise={data} />
  )
}

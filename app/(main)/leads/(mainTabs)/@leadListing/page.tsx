import { SERVERAPI } from '@/Utils/apiFunctions';
import LeadsLising from '../../components/LeadsListing';
import { APIPATH } from '@/shared/constants/url';

export default async function LeadListingPage() {
  const data = SERVERAPI(APIPATH.LEAD.GETALLLEADS)
  const hcoList = SERVERAPI(APIPATH.DROPDOWN_MODULE.HCO)
  console.log(await data)

  return (
    <LeadsLising leadPromise={data} hcoListPromise={hcoList} />
  )
}

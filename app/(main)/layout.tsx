import React, { Suspense } from 'react';
import AppLayout from '@/components/Layout/Layout'
import NProgressHandler from '@/components/NProgress/NprogressHandler';
import DropDownHydrator from '@/components/DropDownHydrator';
import { SERVERAPI } from '@/Utils/apiFunctions';
import { APIPATH } from '@/shared/constants/url';
import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry';

const leadSourcesPromise = SERVERAPI(APIPATH.DROPDOWN.LEADSOURCE)
const personalityTraitsPromise = SERVERAPI(APIPATH.DROPDOWN.PERSONALITYTRAITS)
const hcoPromise = SERVERAPI(APIPATH.DROPDOWN_MODULE.HCO)
const usersPromise = SERVERAPI(APIPATH.DROPDOWN.USERS)
const productsPromise = SERVERAPI(APIPATH.DROPDOWN.PRODUCTS)

const dropDownsPromise = Promise.all([
  leadSourcesPromise,
  personalityTraitsPromise,
  hcoPromise,
  usersPromise,
  productsPromise,
]).then(([leadSources, personalityTraits, hcoList, usersList, products]) => ({
  leadSources,
  personalityTraits,
  hcoList,
  usersList,
  products,
}))

export default function Layout({ children }: { children: React.ReactNode }) {

  return <AppLayout>
    <SuspenseWithBoundary>
      <DropDownHydrator dropDownsPromise={dropDownsPromise} />
    </SuspenseWithBoundary>
    <NProgressHandler />
    {children}
  </AppLayout>;
}

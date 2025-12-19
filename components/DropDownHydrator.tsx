"use client";

import { useDropDownsSetters } from "@/context/store/optimizedSelectors";
import { useApi } from "@/hooks/useAPI";
import { APIPATH } from "@/shared/constants/url";
import { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";


function DropDownHydrator() {
  const API=useApi()
  const pathname=usePathname()
  const [alreadyHydrated,setAleradyHydrated]=useState(false)
  const { setHCOList, setLeadSources, setUsersList, setProducts,setPersonalityTraits,setOutcomes } = useDropDownsSetters();
  useEffect(() => {
    if(alreadyHydrated){
      return
    }
    if(pathname.includes("/leads")||pathname.includes("/deals")||pathname.includes("/dashboard")){
    API.get(APIPATH.DROPDOWN_MODULE.HCO).then(({data}) => {
      setHCOList(data);
    })
    API.get(APIPATH.DROPDOWN.LEADSOURCE).then(({data}) => {
      setLeadSources(data);
    })
    API.get(APIPATH.DROPDOWN.PERSONALITYTRAITS).then(({data}) => {
      setPersonalityTraits(data);
    })
    API.get(APIPATH.DROPDOWN.USERS).then(({data}) => {
      setUsersList(data);
    })
    API.get(APIPATH.DROPDOWN.PRODUCTS).then(({data}) => {
      setProducts(data);
    })
    API.get(APIPATH.DROPDOWN.OUTCOMES).then(({data}) => {
      setOutcomes(data);
    })
    }
    setAleradyHydrated(true)
  }, [pathname]);

  return null;
}

export default memo(DropDownHydrator);


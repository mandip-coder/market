"use client";

import { Healthcare } from "@/app/(main)/healthcares/lib/types";
import { User } from "@/app/(main)/master/user-management/components/UserDataTable";
import { LeadSource, PersonalityTrait } from "@/context/store/dropdownsStore";
import { useDropDownsSetters } from "@/context/store/optimizedSelectors";
import { Product } from "@/context/store/productStore";
import { memo, use, useEffect } from "react";

interface dropDownsPromise {
  hcoList: {
    data: Healthcare[];

  };
  leadSources: {
    data: LeadSource[];

  };
  personalityTraits: {
    data: PersonalityTrait[];

  };
  usersList: {
    data: User[];

  };
  products: {
    data: Product[];
  };
}

function DropDownHydrator({ dropDownsPromise }: { dropDownsPromise: Promise<dropDownsPromise> }) {
  const dropDowns = use(dropDownsPromise)
  const { setHCOList, setLeadSources, setUsersList, setProducts } = useDropDownsSetters();
  useEffect(() => {
    setHCOList(dropDowns.hcoList.data);
    setLeadSources(dropDowns.leadSources.data);
    setUsersList(dropDowns.usersList.data);
    setProducts(dropDowns.products.data);
  }, [dropDowns]);

  return null;
}

export default memo(DropDownHydrator);


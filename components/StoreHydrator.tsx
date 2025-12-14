"use client";

import { memo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLeadStore } from "@/context/store/leadsStore";
import { useDealStore } from "@/context/store/dealsStore";

function StoreHydrator() {
  const { data: session } = useSession();
  const setLeadUser = useLeadStore((state) => state.setUser);
  const setDealUser = useDealStore((state) => state.setUser);

  useEffect(() => {
    if (session?.user) {
      const user = {
        name: session.user.fullName || session.user.name || "Unknown",
        email: session.user.email || "",
        userUUID: (session.user as any).userUUID || "",
      };
      setLeadUser(user);
      setDealUser(user);
    }
  }, [session, setLeadUser, setDealUser]);

  return null;
}

// Memoize to prevent unnecessary re-renders
export default memo(StoreHydrator);


'use client';
import { use, useEffect } from "react";
import { useLeadStore } from "@/context/store/leadsStore";
import { CallLog, Email, FollowUP } from "@/lib/types";

interface LeadHydratorProps {
  followUpsPromise: Promise<{
    data: FollowUP[]
  }>
  callsPromise: Promise<{
    data: CallLog[]
  }>
  emailsPromise: Promise<{
    data: Email[]
  }>
}

export default function LeadHydrator({ followUpsPromise,callsPromise,emailsPromise }: LeadHydratorProps) {
  const { setFollowUps,setCalls,setEmails } = useLeadStore((state) => state);
  const followUpsData = use(followUpsPromise);
  const callsData = use(callsPromise);
  const emailsData = use(emailsPromise);
  
  useEffect(() => {
    if (followUpsData?.data) {
      setFollowUps(followUpsData.data);
    }
    if (callsData?.data) {
      setCalls(callsData.data);
    }
    if(emailsData?.data){
      setEmails(emailsData.data);
    }
  }, []);

  return null;
}

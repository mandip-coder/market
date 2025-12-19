"use client";
import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import { useDealStore } from "@/context/store/dealsStore";
import { Product } from "@/context/store/productStore";
import { CallLog, Email, FollowUP, Meeting, Note } from "@/lib/types";
import { use, useEffect } from "react";

interface DealHydratorProps {
  productsPromise: Promise<{
    data: Product[];
  }>;
  dealProductPromise: Promise<{
    data: Product[];
  }>;
  contactPersonsPromise: Promise<{
    data: HCOContactPerson[];
  }>;
  followUpsPromise: Promise<{
    data: FollowUP[];
  }>;
  callsPromise: Promise<{
    data: CallLog[];
  }>;
  notesPromise: Promise<{
    data: Note[];
  }>;
  meetingsPromise: Promise<{
    data: Meeting[];
  }>;
  emailsPromise: Promise<{
    data: Email[];
  }>;
}

export default function DealHydrator({
  productsPromise,
  dealProductPromise,
  contactPersonsPromise,
  followUpsPromise,
  callsPromise,
  notesPromise,
  meetingsPromise,
  emailsPromise
}: DealHydratorProps) {
  const {
    setProductList,
    setSelectedProducts,
    setContactPersons,
    setFollowUps,
    setCalls,
    setNotes,
    setMeetings,
    setEmails
  } = useDealStore((state) => state);
  const productsData = use(productsPromise);
  const dealProductData = use(dealProductPromise);
  const contactPersonsData = use(contactPersonsPromise);
  const followUpsData = use(followUpsPromise);
  const callsData = use(callsPromise);
  const notesData = use(notesPromise);
  const meetingsData = use(meetingsPromise);
  const emailsData = use(emailsPromise);
  useEffect(() => {
    setProductList(productsData.data);
    setSelectedProducts(dealProductData.data);
    setContactPersons(contactPersonsData.data);
    setFollowUps(followUpsData.data);
    setCalls(callsData.data);
    setNotes(notesData.data);
    setMeetings(meetingsData.data);
    setEmails(emailsData.data);
  }, []);

  return null;
}

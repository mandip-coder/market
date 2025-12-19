import { EmailModal as SharedEmailModal } from '@/components/shared/modals/EmailModal';
import { useDealStore } from '@/context/store/dealsStore';

export default function EmailModal() {
  const emails = useDealStore((state) => state.emails);
  const sendEmail = useDealStore((state) => state.sendEmail);
  const dealUUID = useDealStore((state) => state.dealUUID);
  const contactPersons = useDealStore((state) => state.contactPersons);
  return (
    <SharedEmailModal 
      emails={emails} 
      sendEmail={sendEmail} 
      contactPersons={contactPersons}
      dealUUID={dealUUID}
    />
  );
}

import { EmailModal as SharedEmailModal } from '@/components/shared/modals/EmailModal';
import { useDealStore } from '@/context/store/dealsStore';
import AttachmentModal from './AttachmentModal';

export default function EmailModal({ contacts }: { contacts: any[] }) {
  const { emails, sendEmail } = useDealStore();
  
  return (
    <SharedEmailModal 
      emails={emails} 
      sendEmail={sendEmail} 
      contacts={contacts}
      AttachmentModalComponent={AttachmentModal}
    />
  );
}

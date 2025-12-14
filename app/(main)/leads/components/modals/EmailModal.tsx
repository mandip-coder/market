import { EmailModal as SharedEmailModal } from '@/components/shared/modals/EmailModal';
import { useLeadStore } from '@/context/store/leadsStore';
import AttachmentModal from '@/app/(main)/deals/components/modals/AttachmentModal';

export default function EmailModal() {
  const { emails, sendEmail,contactPersons, } = useLeadStore();
  
  return (
    <SharedEmailModal 
      emails={emails} 
      sendEmail={sendEmail} 
      contacts={contactPersons}
      AttachmentModalComponent={AttachmentModal}
    />
  );
}

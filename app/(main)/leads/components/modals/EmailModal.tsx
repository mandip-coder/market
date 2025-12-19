import { EmailModal as SharedEmailModal } from '@/components/shared/modals/EmailModal';
import { useLeadStore } from '@/context/store/leadsStore';

export default function EmailModal() {
  const { emails, sendEmail,contactPersons,leadUUID } = useLeadStore();
  
  return (
    <SharedEmailModal 
      emails={emails} 
      sendEmail={sendEmail} 
      leadUUID={leadUUID}
      contactPersons={contactPersons}
    />
  );
}

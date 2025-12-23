import { EmailModal as SharedEmailModal } from '@/components/shared/modals/EmailModal';
import { Email } from '@/lib/types';
import { Lead, useSendEmail } from '../../services';

export default function EmailModal({ lead, emails }: { lead: Lead, emails: Email[] }) {

  const sendEmail = useSendEmail(lead.leadUUID);

  return (
    <SharedEmailModal
      emails={emails}
      sendEmail={sendEmail}
      leadUUID={lead.leadUUID}
      contactPersons={lead.contactPersons || []}
    />
  );
}

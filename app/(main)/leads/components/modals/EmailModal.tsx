import { EmailModal as SharedEmailModal } from '@/components/shared/modals/EmailModal';
import { Email } from '@/lib/types';
import { Lead } from '../../services/leads.types';
import { useSendEmail } from '../../services/leads.hooks';
import { useDropdownContactPersons } from '@/services/dropdowns/dropdowns.hooks';

export default function EmailModal({ lead, emails, refetching, refetch }: { lead: Lead, emails: Email[], refetching: boolean, refetch: () => void }) {
  const sendEmail = useSendEmail(lead.leadUUID);
  const { data: contactPersons = [] } = useDropdownContactPersons(lead.hcoUUID)
  return (
    <SharedEmailModal
      emails={emails}
      sendEmail={sendEmail}
      leadUUID={lead.leadUUID}
      contactPersons={contactPersons}
      refetching={refetching}
      refetch={refetch}
      hcoUUID={lead.hcoUUID}
      hcoName={lead.hcoName}
    />
  );
}

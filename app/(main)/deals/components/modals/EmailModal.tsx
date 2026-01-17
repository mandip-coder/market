import { EmailModal as SharedEmailModal } from '@/components/shared/modals/EmailModal';
import { Email } from '@/lib/types';
import { useSendEmail } from '../../services/deals.hooks';
import { Deal } from '../../services/deals.types';
import { useDropdownContactPersons } from '@/services/dropdowns/dropdowns.hooks';

export default function EmailModal({ deal, emails,refetching,refetch }: { deal: Deal, emails: Email[],refetching:boolean,refetch:()=>void }) {
  const sendEmail = useSendEmail(deal.dealUUID);
  const {data:contactPersons=[]}=useDropdownContactPersons(deal.hcoUUID)
  return (
    <SharedEmailModal
      emails={emails}
      sendEmail={sendEmail}
      dealUUID={deal.dealUUID}
      contactPersons={contactPersons}
      refetching={refetching}
      refetch={refetch}
    />
  );
}

import { FollowUpModal as SharedFollowUpModal } from '@/components/shared/modals/FollowUpModal';
import { FollowUP } from '@/lib/types';
import { useDropdownContactPersons } from '@/services/dropdowns/dropdowns.hooks';
import { useCancelFollowUp, useCompleteFollowUp, useCreateFollowUp, useDeleteFollowUp, useRescheduleFollowUp, useUpdateFollowUp } from '../../services/leads.hooks';
import { Lead } from '../../services/leads.types';

export default function FollowUpModal({ lead, followUps, refetching, refetch }: { lead: Lead, followUps: FollowUP[], refetching: boolean, refetch: () => void }) {

  const createFollowUp = useCreateFollowUp(lead.leadUUID);
  const updateFollowUp = useUpdateFollowUp(lead.leadUUID);
  const completeFollowUp = useCompleteFollowUp(lead.leadUUID);
  const cancelFollowUp = useCancelFollowUp(lead.leadUUID);
  const rescheduleFollowUp = useRescheduleFollowUp(lead.leadUUID);
  const deleteFollowUp = useDeleteFollowUp(lead.leadUUID);
  const { data: contactPersons } = useDropdownContactPersons(lead.hcoUUID);

  return (
    <SharedFollowUpModal
      followUps={followUps}
      createFollowUp={createFollowUp}
      updateFollowUp={updateFollowUp}
      completeFollowUp={completeFollowUp}
      cancelFollowUp={cancelFollowUp}
      rescheduleFollowUp={rescheduleFollowUp}
      deleteFollowUp={deleteFollowUp}
      contactPersons={contactPersons || []}
      hcoUUID={lead.hcoUUID}
      hcoName={lead.hcoName}
      leadUUID={lead.leadUUID}
      refetching={refetching}
      refetch={refetch}
    />
  );
}

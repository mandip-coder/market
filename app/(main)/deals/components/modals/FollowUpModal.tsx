import { FollowUpModal as SharedFollowUpModal } from '@/components/shared/modals/FollowUpModal';
import { FollowUP } from '@/lib/types';
import { useDropdownContactPersons } from '@/services/dropdowns/dropdowns.hooks';
import { useCancelFollowUp, useCompleteFollowUp, useCreateFollowUp, useDeleteFollowUp, useRescheduleFollowUp, useUpdateFollowUp } from '../../services/deals.hooks';
import { Deal } from '../../services/deals.types';

export default function FollowUpModal({ deal, followUps, refetching, refetch }: { deal: Deal, followUps: FollowUP[], refetching: boolean, refetch: () => void }) {

  const createFollowUp = useCreateFollowUp(deal.dealUUID);
  const updateFollowUp = useUpdateFollowUp(deal.dealUUID);
  const completeFollowUp = useCompleteFollowUp(deal.dealUUID);
  const cancelFollowUp = useCancelFollowUp(deal.dealUUID);
  const rescheduleFollowUp = useRescheduleFollowUp(deal.dealUUID);
  const deleteFollowUp = useDeleteFollowUp(deal.dealUUID);
  const { data: contactPersons } = useDropdownContactPersons(deal.hcoUUID);


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
      hcoUUID={deal.hcoUUID}
      hcoName={deal.hcoName}
      dealUUID={deal.dealUUID}
      refetching={refetching}
      refetch={refetch}
    />
  );
}

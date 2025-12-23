import { FollowUpModal as SharedFollowUpModal } from '@/components/shared/modals/FollowUpModal';
import { FollowUP } from '@/lib/types';
import { Lead, useCancelFollowUp, useCompleteFollowUp, useCreateFollowUp, useDeleteFollowUp, useContactsPersons, useRescheduleFollowUp, useUpdateFollowUp } from '../../services';

export default function FollowUpModal({ lead, followUps }: { lead: Lead, followUps: FollowUP[] }) {


  const createFollowUp = useCreateFollowUp(lead.leadUUID);
  const updateFollowUp = useUpdateFollowUp(lead.leadUUID);
  const completeFollowUp = useCompleteFollowUp(lead.leadUUID);
  const cancelFollowUp = useCancelFollowUp(lead.leadUUID);
  const rescheduleFollowUp = useRescheduleFollowUp(lead.leadUUID);
  const deleteFollowUp = useDeleteFollowUp(lead.leadUUID);
  // const { data: contactPersons } = useContactsPersons(lead.hcoUUID);
  const contactPersons = lead.contactPersons

  const setFollowUps = (followUps: FollowUP[]) => {

  }

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
      setFollowUps={setFollowUps}
      leadUUID={lead.leadUUID}
    />
  );
}

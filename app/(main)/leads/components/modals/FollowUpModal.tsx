import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import { FollowUpModal as SharedFollowUpModal } from '@/components/shared/modals/FollowUpModal';
import { useLeadFollowUps } from '@/context/store/optimizedSelectors';
import { useCallback } from 'react';

export default function FollowUpModal() {
  const { followUps, addFollowUp, updateFollowUp, completeFollowUp, cancelFollowUp, rescheduleFollowUp, deleteFollowUp, contactPersons, setContactPersons, hcoUUID, hcoName, leadUUID, setFollowUps } = useLeadFollowUps();


  const handleAddContactPerson = useCallback((contact: HCOContactPerson) => {
    setContactPersons([...contactPersons, contact]);
  }, [contactPersons, setContactPersons]);

  return (
    <SharedFollowUpModal
      followUps={followUps}
      addFollowUp={addFollowUp}
      updateFollowUp={updateFollowUp}
      completeFollowUp={completeFollowUp}
      cancelFollowUp={cancelFollowUp}
      rescheduleFollowUp={rescheduleFollowUp}
      deleteFollowUp={deleteFollowUp}
      contactPersons={contactPersons}
      onAddContactPerson={handleAddContactPerson}
      hcoUUID={hcoUUID}
      hcoName={hcoName}
      leadUUID={leadUUID}
      setFollowUps={setFollowUps}
    />
  );
}

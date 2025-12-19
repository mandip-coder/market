import { FollowUpModal as SharedFollowUpModal } from '@/components/shared/modals/FollowUpModal';
import { useDealFollowUps } from '@/context/store/optimizedSelectors';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import { useCallback } from 'react';

export default function FollowUpModal() {
  const { followUps, addFollowUp, updateFollowUp, completeFollowUp, cancelFollowUp, rescheduleFollowUp, deleteFollowUp, contactPersons, setContactPersons, hcoDetails, dealUUID,setFollowUps } = useDealFollowUps();
  
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
      hcoUUID={hcoDetails.hcoUUID}
      hcoName={hcoDetails.hcoName}
      dealUUID={dealUUID}
      setFollowUps={setFollowUps}
    />
  );
}
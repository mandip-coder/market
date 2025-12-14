import { FollowUpModal as SharedFollowUpModal } from '@/components/shared/modals/FollowUpModal';
import { useLeadStore } from '@/context/store/leadsStore';
  import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import { useCallback } from 'react';

export default function FollowUpModal() {
  const { 
    followUps, 
    addFollowUp, 
    updateFollowUp, 
    completeFollowUp, 
    cancelFollowUp, 
    rescheduleFollowUp, 
    deleteFollowUp,
    contactPersons,
    setContactPersons,
    hcoUUID,
    hcoName
  } = useLeadStore();
  
  // Handle adding new contact person to the store
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
    />
  );
}
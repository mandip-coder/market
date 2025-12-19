import { CallModal as SharedCallModal } from '@/components/shared/modals/CallModal';
import { useLeadStore } from '@/context/store/leadsStore';
import { useShallow } from 'zustand/react/shallow';

export const useCallsModalStore=()=>useLeadStore(
  useShallow((state)=>({
    calls: state.calls,
    logCall: state.logCall,
    updateCall: state.updateCall,
    deleteCall: state.deleteCall,
    contactPersons: state.contactPersons,
    setContactPersons: state.setContactPersons,
    leadUUID: state.leadUUID,
    hcoUUID: state.hcoUUID,
    hcoName: state.hcoName,
    setCalls: state.setCalls,
  }))
)

export default function CallModal() {
  const { calls, logCall, updateCall, deleteCall,setCalls,leadUUID } = useCallsModalStore();
  
  return (
    <SharedCallModal 
      calls={calls} 
      logCall={logCall} 
      updateCall={updateCall} 
      deleteCall={deleteCall} 
      setCalls={setCalls}
      leadUUID={leadUUID}
    />
  );
}
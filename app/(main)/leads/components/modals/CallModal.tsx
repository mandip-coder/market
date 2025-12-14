import { CallModal as SharedCallModal } from '@/components/shared/modals/CallModal';
import { useLeadStore } from '@/context/store/leadsStore';

export default function CallModal() {
  const { calls, logCall, updateCall, deleteCall } = useLeadStore();
  
  return (
    <SharedCallModal 
      calls={calls} 
      logCall={logCall} 
      updateCall={updateCall} 
      deleteCall={deleteCall} 
    />
  );
}
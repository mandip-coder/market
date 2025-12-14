import { CallModal as SharedCallModal } from '@/components/shared/modals/CallModal';
import { useDealStore } from '@/context/store/dealsStore';

export default function CallModal() {
  const { calls, logCall, updateCall, deleteCall } = useDealStore();
  
  return (
    <SharedCallModal 
      calls={calls} 
      logCall={logCall} 
      updateCall={updateCall} 
      deleteCall={deleteCall} 
    />
  );
}
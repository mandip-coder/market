import { CallModal as SharedCallModal } from '@/components/shared/modals/CallModal';
import { useDealCallModalStore } from '@/context/store/optimizedSelectors';

export default function CallModal() {
  const { calls, logCall, updateCall, deleteCall,setCalls,dealUUID } = useDealCallModalStore();
  return (
    <SharedCallModal 
      calls={calls} 
      logCall={logCall} 
      updateCall={updateCall} 
      deleteCall={deleteCall}
      setCalls={setCalls}
      dealUUID={dealUUID} 
    />
  );
}
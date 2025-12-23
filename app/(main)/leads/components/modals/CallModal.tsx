import { CallModal as SharedCallModal } from '@/components/shared/modals/CallModal';
import { CallLog } from '@/lib/types';
import { Lead, useCreateCall, useUpdateCall, useDeleteCall } from '../../services';

export default function CallModal({ lead, calls }: { lead: Lead, calls: CallLog[] }) {

  const createCall = useCreateCall(lead.leadUUID);
  const updateCall = useUpdateCall(lead.leadUUID);
  const deleteCall = useDeleteCall(lead.leadUUID);

  return (
    <SharedCallModal
      calls={calls}
      createCall={createCall}
      updateCall={updateCall}
      deleteCall={deleteCall}
      leadUUID={lead.leadUUID}
    />
  );
}

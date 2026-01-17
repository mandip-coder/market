import { CallModal as SharedCallModal } from '@/components/shared/modals/CallModal';
import { CallLog } from '@/lib/types';
import { useCreateCall, useDeleteCall, useUpdateCall } from '../../services/leads.hooks';
import { Lead } from '../../services/leads.types';

export default function CallModal({ lead, calls, refetching, refetch }: { lead: Lead, calls: CallLog[], refetching: boolean, refetch: () => void }) {

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
      refetching={refetching}
      refetch={refetch}
    />
  );
}

import { CallModal as SharedCallModal } from '@/components/shared/modals/CallModal';
import { CallLog } from '@/lib/types';
import { Deal } from '../../services/deals.types';
import { useCreateCall, useDeleteCall, useUpdateCall } from '../../services/deals.hooks';

export default function CallModal({ deal, calls,refetching,refetch }: { deal: Deal, calls: CallLog[],refetching:boolean,refetch:()=>void }) {

  const createCall = useCreateCall(deal.dealUUID);
  const updateCall = useUpdateCall(deal.dealUUID);
  const deleteCall = useDeleteCall(deal.dealUUID);

  return (
    <SharedCallModal
      calls={calls}
      createCall={createCall}
      updateCall={updateCall}
      deleteCall={deleteCall}
      dealUUID={deal.dealUUID}
      refetching={refetching}
      refetch={refetch}
    />
  );
}

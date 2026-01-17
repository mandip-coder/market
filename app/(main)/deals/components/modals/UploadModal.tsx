'use client';

import { UploadModal as SharedUploadModal } from '@/components/shared/modals/UploadModal';
import { memo } from 'react';
import { Deal } from '../../services/deals.types';
import { Attachment } from '@/lib/types';
import { useCreateDealAttachment, useDeleteDealAttachment } from '../../services/deals.hooks';

interface UploadModalProps {
  deal: Deal;
  attachments: Attachment[];
  refetching: boolean;
  refetch: () => void;
}

const UploadDocumentsModal: React.FC<UploadModalProps> = ({deal, attachments, refetching, refetch}) => {
  const { mutate: uploadFile } = useCreateDealAttachment(deal.dealUUID);
  const { mutate: removeAttachment } = useDeleteDealAttachment(deal.dealUUID);

  return (
    <SharedUploadModal
      dealUUID={deal.dealUUID}
      attachments={attachments}
      uploadFile={uploadFile} 
      removeAttachment={removeAttachment}
      refetching={refetching}
      refetch={refetch}
    />
  );
};

export default memo(UploadDocumentsModal);

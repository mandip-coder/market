'use client';

import { UploadModal as SharedUploadModal } from '@/components/shared/modals/UploadModal';
import { useLeadStore } from '@/context/store/leadsStore';
import { memo } from 'react';

const UploadModal: React.FC = () => {
  const { attachments, uploadFile, removeAttachment } = useLeadStore();

  return (
    <SharedUploadModal
      attachments={attachments}
      uploadFile={uploadFile}
      removeAttachment={removeAttachment}
    />
  );
};

export default memo(UploadModal);

'use client';

import { UploadModal as SharedUploadModal } from '@/components/shared/modals/UploadModal';
import { useDealStore } from '@/context/store/dealsStore';
import { memo } from 'react';

const UploadModal: React.FC = () => {
  const { attachments, uploadFile, removeAttachment } = useDealStore();

  return (
    <SharedUploadModal
      attachments={attachments}
      uploadFile={uploadFile}
      removeAttachment={removeAttachment}
    />
  );
};

export default memo(UploadModal);

import React, { useState } from 'react';
import { Upload, Image } from 'antd';
import type { UploadFile, UploadProps, UploadChangeParam } from 'antd/es/upload/interface';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from '@/components/AppToaster/AppToaster';
import { fromByte, toByte } from '@/Utils/helpers';

interface FileUploaderProps extends Omit<UploadProps, 'fileList' | 'onChange'> {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  uploadUrl?: string;
  maxCount: number;
  listType?: 'text' | 'picture' | 'picture-card';
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  customButton?: React.ReactNode;
  showPreview?: boolean;
  maxSizeMB?: number;
  toastDuration?: number;
  name?: string;
  headers?: Record<string, string>;
  data?: Record<string, any>;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  value = [],
  onChange,
  uploadUrl = '',
  maxCount,
  listType = 'picture-card',
  accept,
  multiple = false,
  disabled = false,
  customButton,
  showPreview = true,
  maxSizeMB = 5,
  toastDuration = 2000,
  name = 'file',
  headers,
  data,
  ...props
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(value);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!showPreview) return;
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = (await getBase64(file.originFileObj)) as string;
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file, fileListToUpload) => {
    const total = fileList.length + fileListToUpload.length;
    if (total > maxCount) {
      toast.error(`You can only upload up to ${maxCount} files.`, {
        autoClose: toastDuration,
      });
      return Upload.LIST_IGNORE;
    }
    if (fromByte(file.size, 'MB') as number > maxSizeMB) {
      toast.warning(`"${file.name}" exceeds ${maxSizeMB} MB limit.`, {
        autoClose: toastDuration,
      });
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleChange = ({ fileList: newList }: UploadChangeParam<UploadFile>) => {
    const trimmedList = newList.slice(0, maxCount);
    setFileList(trimmedList);
    onChange?.(trimmedList);
  };

  const defaultButton =
    listType === 'picture-card' ? (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    ) : (
      <button type="button" style={{ border: 'none', background: 'none' }}>
        <UploadOutlined /> Upload
      </button>
    );

  return (
    <div onDragOver={(e) => e.preventDefault()}>
      <Upload
        action={uploadUrl}
        name={name}
        headers={headers}
        data={data}
        listType={listType}
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        {...props}
      >
        {fileList.length < maxCount && (customButton || defaultButton)}
      </Upload>

      {showPreview && previewImage && (
        <Image
          preview={{
            open: previewOpen,
            onOpenChange: setPreviewOpen,
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
};

export default FileUploader;

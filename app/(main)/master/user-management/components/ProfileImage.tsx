'use client'
import { toast } from '@/components/AppToaster/AppToaster';
import { APIPATH } from "@/shared/constants/url";
import { Avatar, Button, Upload } from "antd";
import { Camera, Trash2, User } from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";
import ImageCropper from "./ImageCropper";

interface ProfileImageProps {
  imageUrl: string | null;
  onImageChange: (file: File, url: string) => void;
  onImageRemove: () => void;
  title?: string
  moduleName: string
}

function ProfileImage({ imageUrl, onImageChange, onImageRemove, title, moduleName }: ProfileImageProps) {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  
  // Store the promise resolvers for the upload process
  const uploadPromiseRef = useRef<{
    resolve: (file: File) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const handleBeforeUpload = useCallback((file: File) => {
    return new Promise<File>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          setImgSrc(reader.result);
          // Store resolvers to be called later
          uploadPromiseRef.current = { resolve, reject };
          setCropModalOpen(true);
        }
      });
      reader.readAsDataURL(file);
    });
  }, []);

  const handleSaveCrop = useCallback((croppedFile: File,) => {
    // 1. Resolve the upload promise with the new cropped file
    if (uploadPromiseRef.current) {
      uploadPromiseRef.current.resolve(croppedFile);
      uploadPromiseRef.current = null;
    }

    // 2. We don't call onImageChange here anymore. 
    // We wait for the upload to complete and get the server URL.
    
    // 3. Close modal
    setCropModalOpen(false);
  }, []);

  const handleUploadChange = useCallback((info: any) => {
    if (info.file.status === 'done') {
      const response = info.file.response;
      if (response?.success && response?.fileUrl) {
        onImageChange(info.file.originFileObj, response.fileUrl);
      } else {
        toast.error(response?.message || 'Upload failed');
      }
    } else if (info.file.status === 'error') {
      toast.error('Upload failed');
    }
  }, [onImageChange]);

  const handleCloseCrop = useCallback(() => {
    setCropModalOpen(false);
    // If the user cancels cropping, we reject the upload promise to stop the upload
    if (uploadPromiseRef.current) {
      uploadPromiseRef.current.reject('Crop cancelled');
      uploadPromiseRef.current = null;
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    onImageRemove();
    toast.success('Profile image removed');
  }, [onImageRemove]);

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="relative group flex justify-center items-center">
          <Avatar
            size={100}
            src={imageUrl || undefined}
            icon={<User className="h-12 w-12" />}
            className="border-3 border-white shadow-lg"
          />

          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex gap-2">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
                onChange={handleUploadChange}
                action={APIPATH.FILEUPLOAD}
                data={{
                  moduleName: moduleName,
                }}
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<Camera className="h-4 w-4" />}
                  className="bg-blue-500 hover:bg-blue-600 border-none shadow-md"
                  size="small"
                />
              </Upload>

              {imageUrl && (
                <Button
                  type="primary"
                  shape="circle"
                  danger
                  icon={<Trash2 className="h-4 w-4" />}
                  className="bg-red-500 hover:bg-red-600 border-none shadow-md"
                  onClick={handleRemoveImage}
                  size="small"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="font-medium text-xl text-center">{title || "Profile Picture"}</p>

      <ImageCropper
        imageSrc={imgSrc}
        open={cropModalOpen}
        onClose={handleCloseCrop}
        onSave={handleSaveCrop}
      />
    </>
  );
}

export default memo(ProfileImage);
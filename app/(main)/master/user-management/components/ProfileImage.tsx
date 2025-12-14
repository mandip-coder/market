'use client'
import { Avatar, Button, Upload } from "antd";
import { Camera, Trash2, User } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { toast } from "react-toastify";
import ImageCropper from "./ImageCropper";

interface ProfileImageProps {
  imageUrl: string | null;
  onImageChange: (file: File, url: string) => void;
  onImageRemove: () => void;
  title?: string
}

 function ProfileImage({ imageUrl, onImageChange, onImageRemove,title }: ProfileImageProps) {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  const handleImageUpload = useCallback((file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setImgSrc(reader.result);
        setCropModalOpen(true);
      }
    });
    reader.readAsDataURL(file);
  }, []);

  const handleSaveCrop = useCallback((croppedFile: File, croppedUrl: string) => {
    onImageChange(croppedFile, croppedUrl);
  }, [onImageChange]);

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
                beforeUpload={(file) => {
                  handleImageUpload(file);
                  return false;
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
        onClose={() => setCropModalOpen(false)}
        onSave={handleSaveCrop}
      />
    </>
  );
}

export default memo(ProfileImage);
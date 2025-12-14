'use client'
import { Avatar, Button, Col, Modal, Row, Slider } from "antd";
import { Edit2, RotateCw, User, ZoomIn, ZoomOut } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import Cropper, { Area, Point } from 'react-easy-crop';
import { toast } from "react-toastify";

// Helper functions for image processing
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180;

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  const rotRad = getRadianAngle(rotation);
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No 2d context for cropped canvas');
  }

  const safeX = isFinite(pixelCrop.x) ? pixelCrop.x : 0;
  const safeY = isFinite(pixelCrop.y) ? pixelCrop.y : 0;
  const safeWidth = isFinite(pixelCrop.width) ? Math.max(1, pixelCrop.width) : 1;
  const safeHeight = isFinite(pixelCrop.height) ? Math.max(1, pixelCrop.height) : 1;

  croppedCanvas.width = safeWidth;
  croppedCanvas.height = safeHeight;

  try {
    const imageData = ctx.getImageData(safeX, safeY, safeWidth, safeHeight);
    croppedCtx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error in putImageData:', error);
    croppedCtx.drawImage(
      canvas,
      safeX,
      safeY,
      safeWidth,
      safeHeight,
      0,
      0,
      safeWidth,
      safeHeight
    );
  }

  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        const dataUrl = croppedCanvas.toDataURL('image/jpeg');
        fetch(dataUrl)
          .then(res => res.blob())
          .then(resolve)
          .catch(() => {
            resolve(new Blob([''], { type: 'image/jpeg' }));
          });
      }
    }, 'image/jpeg');
  });
};

interface ImageCropperProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onSave: (croppedImage: File, croppedUrl: string) => void;
}

function ImageCropper({ imageSrc, open, onClose, onSave }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropperKey, setCropperKey] = useState(0);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    const validatedArea = {
      x: isFinite(croppedAreaPixels.x) ? croppedAreaPixels.x : 0,
      y: isFinite(croppedAreaPixels.y) ? croppedAreaPixels.y : 0,
      width: isFinite(croppedAreaPixels.width) ? Math.max(1, croppedAreaPixels.width) : 100,
      height: isFinite(croppedAreaPixels.height) ? Math.max(1, croppedAreaPixels.height) : 100,
    };
    setCroppedAreaPixels(validatedArea);
  }, []);

  useEffect(() => {
    if (!imageSrc || !croppedAreaPixels) return;

    const generatePreview = async () => {
      try {
        const validatedRotation = isFinite(rotation) ? rotation % 360 : 0;
        const validatedCroppedAreaPixels = {
          x: isFinite(croppedAreaPixels.x) ? Math.max(0, croppedAreaPixels.x) : 0,
          y: isFinite(croppedAreaPixels.y) ? Math.max(0, croppedAreaPixels.y) : 0,
          width: isFinite(croppedAreaPixels.width) ? Math.max(1, croppedAreaPixels.width) : 100,
          height: isFinite(croppedAreaPixels.height) ? Math.max(1, croppedAreaPixels.height) : 100,
        };

        const croppedImage = await getCroppedImg(
          imageSrc,
          validatedCroppedAreaPixels,
          validatedRotation
        );
        const url = URL.createObjectURL(croppedImage);

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(url);
      } catch (e) {
        console.error('Failed to generate preview:', e);
        if (imageSrc) {
          setPreviewUrl(imageSrc);
        }
      }
    };

    generatePreview();
  }, [imageSrc, croppedAreaPixels, rotation]);

  const handleSaveCrop = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      const validatedRotation = isFinite(rotation) ? rotation % 360 : 0;
      const validatedCroppedAreaPixels = {
        x: isFinite(croppedAreaPixels.x) ? Math.max(0, croppedAreaPixels.x) : 0,
        y: isFinite(croppedAreaPixels.y) ? Math.max(0, croppedAreaPixels.y) : 0,
        width: isFinite(croppedAreaPixels.width) ? Math.max(1, croppedAreaPixels.width) : 100,
        height: isFinite(croppedAreaPixels.height) ? Math.max(1, croppedAreaPixels.height) : 100,
      };

      const croppedImage = await getCroppedImg(
        imageSrc,
        validatedCroppedAreaPixels,
        validatedRotation
      );

      const croppedFile = new File([croppedImage], 'profile-image.jpg', { type: 'image/jpeg' });
      const croppedUrl = URL.createObjectURL(croppedImage);

      onSave(croppedFile, croppedUrl);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    }
  }, [croppedAreaPixels, imageSrc, rotation, onClose, onSave]);

  const handleZoomIn = () => {
    setZoom(prevZoom => {
      const newZoom = prevZoom + 0.1;
      return isFinite(newZoom) ? Math.min(newZoom, 3) : 3;
    });
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => {
      const newZoom = prevZoom - 0.1;
      return isFinite(newZoom) ? Math.max(newZoom, 0.5) : 0.5;
    });
  };

  const handleRotate = () => {
    setRotation(prevRotation => {
      const newRotation = (prevRotation + 90) % 360;
      return isFinite(newRotation) ? newRotation : 0;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setCropperKey(prev => prev + 1);
  };

  // Clean up the object URL when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Modal
      destroyOnHidden
      title={
        <div className="flex items-center">
          <Edit2 className="h-4 w-4 mr-2 text-blue-500" />
          <span>Crop Profile Picture</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveCrop}>
          Save
        </Button>,
      ]}
      width={700}
      centered
    >
      <div className="space-y-3">
        <Row gutter={12}>
          <Col span={16}>
            <div
              className="crop-container relative overflow-hidden bg-gray-100 rounded-lg shadow-inner"
              style={{ height: 350 }}
            >
              {imageSrc && (
                <Cropper
                  key={cropperKey}
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                />
              )}
            </div>
          </Col>
          <Col span={8}>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="text-xs font-medium mb-2 text-center">Preview</h4>
                <div className="flex justify-center">
                  <Avatar
                    size={120}
                    src={previewUrl || undefined}
                    icon={<User className="h-16 w-16" />}
                    className="border-2 border-gray-300 shadow-md"
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs font-medium mb-2">Zoom</div>
                <div className="flex items-center space-x-2">
                  <Button
                    icon={<ZoomOut className="h-3 w-3" />}
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    size="small"
                    className="flex-shrink-0"
                  />
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(value) => setZoom(isFinite(value) ? value : 1)}
                    className="flex-1"
                  />
                  <Button
                    icon={<ZoomIn className="h-3 w-3" />}
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    size="small"
                    className="flex-shrink-0"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  icon={<RotateCw className="h-3 w-3" />}
                  onClick={handleRotate}
                  className="flex-1"
                  size="small"
                >
                  Rotate
                </Button>
                <Button onClick={handleReset} className="flex-1" size="small">
                  Reset
                </Button>
              </div>

              <div className="text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg py-1">
                {isFinite(zoom) ? zoom.toFixed(1) : '1.0'}x • {isFinite(rotation) ? rotation : 0}°
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
}
export default memo(ImageCropper);
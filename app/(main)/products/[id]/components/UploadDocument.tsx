import { toast } from '@/components/AppToaster/AppToaster';
import ModalWrapper from "@/components/Modal/Modal";
import { CustomUploadList } from "@/components/shared/modals/AttachmentModal";
import { useDropdownProductDocumentCategories } from "@/services/dropdowns/dropdowns.hooks";
import { APIPATH } from "@/shared/constants/url";
import { fromByte, toByte } from "@/Utils/helpers";
import { Button, Checkbox, Input, Select, Space } from "antd";
import { UploadFile } from "antd/es/upload";
import { DraggerProps, Upload } from "antd/lib";
import { Edit, InboxIcon, Upload as UploadIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  useCreateProductDocument,
  useUpdateProductDocument,
} from "../../services/products.hooks";
import { ProductDocument } from "../../services/types";

interface UploadDocumentModalProps {
  productUUID: string;
  document?: ProductDocument; // Optional: for edit mode
  open?: boolean; // Optional: for controlled mode
  onOpenChange?: (open: boolean) => void; // Optional: for controlled mode
}

export const UploadDocumentModal = ({
  productUUID,
  document,
  open: controlledOpen,
  onOpenChange,
}: UploadDocumentModalProps) => {
  const isEditMode = !!document;
  const [internalOpen, setInternalOpen] = useState<boolean>(false);

  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };
  const [category, setCategory] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [sensitive, setSensitive] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { mutateAsync: createProductDocument } = useCreateProductDocument();
  const { mutateAsync: updateProductDocument } = useUpdateProductDocument();
  const { data: categories = [] } = useDropdownProductDocumentCategories();

  // Pre-populate form when editing
  useEffect(() => {
    if (document && open) {
      setCategory(document.documentCategoryUUID);
      setDocumentName(document.documentName);
      setNotes(document.notes || "");
      setSensitive(document.sensitive);
      // Don't pre-populate file list - user will upload new file if needed
      setFileList([]);
    }
  }, [document, open]);

  const onClose = () => {
    setOpen(false);
    setCategory("");
    setDocumentName("");
    setNotes("");
    setSensitive(false);
    setFileList([]);
  };

  const MAX_SIZE = toByte(50, "MB");

  const handleClear = useCallback(() => {
    setFileList([]);
    toast.info("File removed!");
  }, []);

  const handleSubmit = async () => {
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!documentName) {
      toast.error("Please enter document name");
      return;
    }

    // In edit mode, file upload is optional (can keep existing file)
    // In create mode, file upload is required
    if (!isEditMode && (fileList.length === 0 || !fileList[0].response)) {
      toast.error("Please wait for file to upload or select a file");
      return;
    }

    let fileData;
    if (fileList.length > 0 && fileList[0].response) {
      // New file uploaded
      fileData = fileList[0].response;
    } else if (isEditMode && document) {
      // No new file, use existing file data in edit mode
      fileData = {
        fileName: document.fileName,
        filePath: document.filePath,
        fileUrl: document.url,
        fileType: document.mimeType,
        fileSize: document.size,
      };
    } else {
      toast.error("Please upload a file");
      return;
    }

    // Prepare the payload
    const payload = {
      documentName: documentName,
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      notes: notes || "",
      url: fileData.fileUrl,
      sensitive: sensitive,
      productUUID: productUUID,
      documentCategoryUUID: category,
      mimeType: fileData.fileType,
      size: fileData.fileSize,
    };

    if (isEditMode) {
      // Update existing document
      await updateProductDocument(
        {
          ...payload,
          productDocumentUUID: document.productDocumentUUID,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      await createProductDocument(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const draggerProps: DraggerProps = {
    action: APIPATH.FILEUPLOAD,
    multiple: false,
    fileList,
    data: {
      moduleName: "productDocument",
    },
    showUploadList: false, // Hide default list, using custom component

    beforeUpload: (file: File) => {
      const MAX_FILE_SIZE_MB = 100;
      const uploadSize = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
      if (!uploadSize) {
        toast.error(`File must be smaller than ${MAX_FILE_SIZE_MB}MB!`);
        return Upload.LIST_IGNORE;
      }

      // Auto-fill document name if empty
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }

      return true;
    },

    onChange: (info) => {
      setFileList(info.fileList);

      // Handle successful upload
      if (info.file.status === "done") {
        toast.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === "error") {
        toast.error(`${info.file.name} upload failed`);
      }
    },
    onRemove: handleClear,
  };

  return (
    <>
      {!isEditMode && (
        <Button
          type="primary"
          icon={<UploadIcon className="h-4 w-4" />}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          Upload Document
        </Button>
      )}
      <ModalWrapper
        title={isEditMode ? "Edit Document" : "Upload Document"}
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            disabled={
              !category ||
              !documentName ||
              (!isEditMode && fileList.length === 0)
            }
          >
            {isEditMode ? "Update Document" : "Upload Document"}
          </Button>,
        ]}
        width={600}
        className="dark-modal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="capitalize">
              <Select
                value={category}
                onChange={setCategory}
                className="w-full"
                placeholder="Select a category"
                options={categories.map((cat) => ({
                  value: cat.documentcategoryUUID,
                  label: cat.documentcategoryName,
                }))}
                optionRender={(option) => (
                  <span className="capitalize">{option.label}</span>
                )}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Document Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              File {!isEditMode && <span className="text-red-500">*</span>}
              {isEditMode && (
                <span className="text-xs text-slate-500 ml-2">
                  (Optional - upload only if you want to replace the existing
                  file)
                </span>
              )}
            </label>
            <Space orientation="vertical" className="w-full">
              <Upload.Dragger
                {...draggerProps}
                className="block my-upload mb-4"
              >
                <p className="flex place-content-center mb-4">
                  <InboxIcon size={30} />
                </p>
                <p className="ant-upload-text">
                  Drag and drop, or click to select a file
                </p>
                <p className="ant-upload-hint">
                  Maximum file size: {fromByte(MAX_SIZE, "MB", true)}
                </p>
              </Upload.Dragger>
              <CustomUploadList
                fileList={fileList}
                onRemove={handleClear}
                className="w-full"
              />
            </Space>
          </div>
          <div>
            <Checkbox
              checked={sensitive}
              onChange={(e) => setSensitive(e.target.checked)}
            >
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Mark as sensitive document
              </span>
            </Checkbox>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <Input.TextArea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes..."
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

// Export a separate component for edit mode
export const EditDocumentButton = ({
  productUUID,
  document,
}: {
  productUUID: string;
  document: ProductDocument;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="text"
        size="small"
        icon={<Edit className="h-4 w-4" />}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
      >
        Edit
      </Button>
      <UploadDocumentModal
        productUUID={productUUID}
        document={document}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};

import { useState } from "react";
import {
  InboxOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import {
  Button,
  Drawer,
  Radio,
  Space,
  Typography,
  Upload
} from "antd";

import { parseString } from "xml2js";
import { toast } from '@/components/AppToaster/AppToaster'
import { fromByte, toByte } from "@/Utils/helpers";
import type { DraggerProps, RcFile } from "antd/es/upload";
import { AnimatePresence, motion } from "motion/react"
interface Props {
  btnText: string;
  getFormData?: (data: unknown) => void;
}

export const UploadXML = ({ btnText, getFormData }: Props) => {
  const [open, setOpen] = useState(false);
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false)
  }
  const afterClose = (visible: boolean) => {
    if (visible) return
    setOpen(false);
    setFileList([]);
    setXmlType("R2");
  };


  const handleUpload = () => {
    if (fileList.length === 0) {
      toast.warning("Please select a file to upload.");
      return;
    }

    const file = fileList[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const xml = e.target.result;
      parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) {
          toast.error("Failed to parse XML.");
          return;
        }

        getFormData?.(result); 
        toast.success("XML parsed and form data loaded.");
      });
    };
    reader.readAsText(file)
    setOpen(false)
    setFileList([])
  };

  const handleClear = () => {
    setFileList([]);
    toast.info("File selection cleared.");
  };
  const MAX_SIZE = toByte(15, "KB");

  const draggerProps: DraggerProps = {
    name: "file",
    multiple: false,
    accept: ".xml",
    fileList,
    beforeUpload: (file: RcFile) => {
      if (file.size > MAX_SIZE) {
        toast.error(`File size exceeds ${fromByte(MAX_SIZE, "KB", true)} limit.`);
        return false;
      }
      if(file.type !== "text/xml") {
        toast.error("Please select an XML file.");
        return false;
      }
      setFileList([file]);
      return false;
    },
    onRemove: handleClear,

  };

  type XmlType = "R2" | "R3";


  const { Dragger } = Upload;
const [xmlType, setXmlType] = useState<XmlType>("R2");
  return (
    <>
      <Button
        color="primary"
        variant="dashed"
        onClick={showDrawer}
        icon={<UploadOutlined />}
      >
        {btnText}
      </Button>

      <Drawer
        maskClosable={false}
        title={`Upload XML File`}
        onClose={onClose}
        afterOpenChange={afterClose}
        open={open}
        footer={

          <Space>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleUpload}
              disabled={fileList.length === 0}
            >
              Upload
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleClear}
              disabled={fileList.length === 0}
            >
              Clear
            </Button>
          </Space>
        }
        extra={
          <Radio.Group
            buttonStyle="solid"
            value={xmlType} onChange={(e) => setXmlType(e.target.value)}>
            <Radio.Button value="R2">R2</Radio.Button>
            <Radio.Button value="R3">R3</Radio.Button>
          </Radio.Group>
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={xmlType}
            initial={{ opacity: 0, }}
            animate={{ opacity: 1, }}
            exit={{ opacity: 0, }}
            transition={{ duration: 0.3 }}
          >
            <Typography.Title rootClassName="!mb-4" level={4}>
              Upload XML ({xmlType})
            </Typography.Title>
          </motion.div>
        </AnimatePresence>


        <Space orientation="vertical" className="w-full">
          <Dragger   {...draggerProps} className="!h-100 block my-upload">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag an XML file here to upload
            </p>
            <p className="ant-upload-hint">
              Only XML files are allowed. Uploads are not sent automatically.
            </p>
          </Dragger>

        </Space>
      </Drawer>
    </>
  );
};

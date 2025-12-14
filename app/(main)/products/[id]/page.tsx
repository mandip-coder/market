"use client";

import { fromByte, GlobalDate, toByte } from "@/Utils/helpers";
import { CardHeader } from "@/components/CardHeader/CardHeader";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  List,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography
} from "antd";
import { RcFile } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";
import { CheckboxChangeEvent, DraggerProps } from "antd/lib";
import {
  Activity,
  Building2,
  Calendar, DollarSign,
  Download,
  Edit,
  FileText,
  Folder,
  InboxIcon,
  Loader2,
  Pill,
  Plus,
  Search,
  TrendingUp,
  Upload,
  User,
  Users
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { stages, Stage, Deal, STAGE_LABELS } from "@/lib/types";

const { Title, Text, Paragraph } = Typography;


interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  isCurrentUser?: boolean;
}
interface Document {
  id: number;
  name: string;
  date: string;
  uploadedBy: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  color: string;
  documents: Document[];
}

interface DealStatus {
  status: stages;
  color: string;
  description: string;
}



interface ICBData {
  code: string;
  name: string;
  consumption: number;
  status: string;
  priority: "green" | "amber" | "red";
  lastContact: string;
}



// Mock Data (unchanged)
const MOCK_PRODUCT: Product = {
  productUUID: "product1",
  productCode: "PRD-001",
  productName: "Cardiomax 50mg",
  therapeuticArea: "Cardiovascular",
  productErpId: 1,
  createdAt: "2025-01-15T08:00:00Z",
  updatedAt: "2025-10-28T10:30:00Z",
  createdBy: "1",
  updatedBy: "1",
  genericName: "Cardiomax",
  dealProductUUID: "product1",
};

const MOCK_DOCUMENTS: Record<string, Document[]> = {
  regulatory: [
    { id: 1, name: "Summary of Product Characteristics (SPC)", date: "2025-10-15", uploadedBy: "John Smith" },
    { id: 2, name: "Patient Information Leaflet (PIL)", date: "2025-10-15", uploadedBy: "John Smith" },
    { id: 3, name: "Product Artwork", date: "2025-09-20", uploadedBy: "Sarah Jones" }
  ],
  marketing: [
    { id: 4, name: "Product Launch Campaign", date: "2025-10-01", uploadedBy: "Marketing Team" },
    { id: 5, name: "Patient Education Flyer", date: "2025-09-25", uploadedBy: "Marketing Team" }
  ],
  clinical: [
    { id: 6, name: "Clinical Trial Summary", date: "2025-08-10", uploadedBy: "Dr. Williams" },
    { id: 7, name: "Safety Profile Presentation", date: "2025-08-15", uploadedBy: "Dr. Williams" }
  ],
  commercial: [
    { id: 8, name: "Market Access Dashboard", date: "2025-10-20", uploadedBy: "Commercial Team" },
    { id: 9, name: "Daily Activity Tracker", date: "2025-10-28", uploadedBy: "Commercial Team" }
  ]
};

const MOCK_DEAL_STATUS: DealStatus[] = [
  { status: Stage.DISCUSSION, color: "#1677FF", description: "Detailed product benefits and clinical data review" },
  { status: Stage.NEGOTIATION, color: "#FAAD14", description: "Commercial terms and agreement discussions" },
];




const MOCK_ICB_DATA: ICBData[] = [
  { code: "ICB001", name: "NHS Birmingham and Solihull", consumption: 25000, status: "Commercial", priority: "green", lastContact: "2025-10-25" },
  { code: "ICB002", name: "NHS Black Country", consumption: 18500, status: "Agreement", priority: "green", lastContact: "2025-10-20" },
  { code: "ICB003", name: "NHS Coventry and Warwickshire", consumption: 15200, status: "Negotiation", priority: "amber", lastContact: "2025-10-15" },
  { code: "ICB004", name: "NHS Herefordshire and Worcestershire", consumption: 12800, status: "Discussion", priority: "amber", lastContact: "2025-10-10" },
  { code: "ICB005", name: "NHS Shropshire, Telford and Wrekin", consumption: 9500, status: "Follow up", priority: "red", lastContact: "2025-10-05" }
];


export default function EnhancedProductDetailPage() {
  const [product] = useState<Product>(MOCK_PRODUCT);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>("overview");
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [addFieldModalOpen, setAddFieldModalOpen] = useState<boolean>(false);

  const stats = [
    {
      title: "Generic Name",
      value: product.genericName,
      icon: <DollarSign className="h-6 w-6 text-emerald-500" />,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "ERP ID",
      value: product.productErpId || "—",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Last Sync",
      value: GlobalDate(product.updatedAt),
      icon: <Calendar className="h-6 w-6 text-purple-500" />,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Therapeutic Area",
      value: product.therapeuticArea || "—",
      icon: <Activity className="h-6 w-6 text-orange-500" />,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];


  // Tab items with improved icons and labels
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </span>
      ),
      children: <OverviewTab product={product} />
    },
    {
      key: 'repository',
      label: (
        <span className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
        </span>
      ),
      children: <RepositoryTab setUploadModalOpen={setUploadModalOpen} setAddFieldModalOpen={setAddFieldModalOpen} />
    },

    {
      key: 'tracker',
      label: (
        <span className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Deal</span>
        </span>
      ),
      children: <TrackerTab />
    },
    {
      key: 'icb',
      label: (
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Healthcares</span>
        </span>
      ),
      children: <ICBTab />
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <>
      <main className="">
        {/* Header Section with Modern Design */}
        <Card variant="borderless" className="!mb-6"
          title={
            <CardHeader icon={<Pill />}
              title={product.productName} />
          }
          extra={
            <div className="flex gap-2">
              <Button
                icon={<Download className="h-4 w-4" />}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                type="primary"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>
          }
        >
          {/* KPI Cards with Enhanced Design */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm hover:shadow transition-all"
              >
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </div>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tab Navigation with Modern Design */}
        <Card variant="borderless">
          <Tabs
            activeKey={activeTabKey}
            onChange={setActiveTabKey}
            items={tabItems}
          />
        </Card>
      </main>

      {/* Modals */}
      <EditModal open={editModalOpen} onClose={() => setEditModalOpen(false)} product={product} />
      <UploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
      <AddFieldModal open={addFieldModalOpen} onClose={() => setAddFieldModalOpen(false)} />
    </>
  );
}

// Tab Components with Enhanced Design
interface OverviewTabProps {
  product: Product;
}

const OverviewTab = ({ product }: OverviewTabProps) => (
  <div className="space-y-6">
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card variant="borderless" className="h-full " size="small">
          <Title level={4} className="text-slate-900 dark:text-slate-100">Product Details</Title>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card className="h-full" variant="borderless" size="small">
          <Title level={4} className="text-slate-900 dark:text-slate-100">Recent Activity</Title>
          <List
            className="mt-4"
            itemLayout="horizontal"
            dataSource={[
              {
                icon: <FileText className="h-5 w-5 text-blue-500" />,
                title: "SPC Document Updated",
                description: "Regulatory team updated the SPC document",
                time: "2 hours ago"
              },
              {
                icon: <Users className="h-5 w-5 text-green-500" />,
                title: "New ICB Deal",
                description: "NHS Birmingham started Discussion",
                time: "1 day ago"
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
                title: "Consumption Increased",
                description: "15% increase in monthly consumption",
                time: "3 days ago"
              }
            ]}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={item.icon}
                  title={<span className="text-slate-900 dark:text-slate-100">{item.title}</span>}
                  description={
                    <div>
                      <Paragraph className="mb-1 text-slate-600 dark:text-slate-300">{item.description}</Paragraph>
                      <Text type="secondary" className="text-xs">{item.time}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>

  </div>
);

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-700">
    <Text type="secondary" className="text-slate-500 dark:text-slate-400">{label}</Text>
    <Text strong className="text-slate-900 dark:text-slate-200">{value}</Text>
  </div>
);

interface RepositoryTabProps {
  setUploadModalOpen: (open: boolean) => void;
  setAddFieldModalOpen: (open: boolean) => void;
}

const RepositoryTab = ({ setUploadModalOpen, setAddFieldModalOpen }: RepositoryTabProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["regulatory", "marketing", "clinical", "commercial"]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories: DocumentCategory[] = [
    { id: "regulatory", name: "Regulatory", color: "blue", documents: MOCK_DOCUMENTS.regulatory },
    { id: "marketing", name: "Marketing", color: "green", documents: MOCK_DOCUMENTS.marketing },
    { id: "clinical", name: "Clinical", color: "purple", documents: MOCK_DOCUMENTS.clinical },
    { id: "commercial", name: "Commercial", color: "orange", documents: MOCK_DOCUMENTS.commercial }
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredDocuments = (docs: Document[]): Document[] => {
    if (!searchTerm) return docs;
    return docs.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search documents..."
            prefix={<Search className="h-4 w-4 text-slate-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setAddFieldModalOpen(true)}
            className="flex items-center gap-2"
          >
            Add Category
          </Button>
          <Button
            type="primary"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            type={selectedCategories.includes(category.id) ? "primary" : "default"}
            size="small"
            className="flex items-center gap-1"
          >
            {category.name}
            <span className="text-xs">({category.documents.length})</span>
          </Button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {selectedCategories.flatMap(categoryId => {
          const category = categories.find(c => c.id === categoryId);
          if (!category) return [];

          return filteredDocuments(category.documents).map((doc) => (
            <Card
              key={doc.id}
              variant="borderless"
              className="group dark:!border-dark-border dark:!border dark:hover:!bg-slate-800/50"
              size="small"
              hoverable
            >
              <div className="flex flex-col h-full">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-${category.color}-100 dark:bg-${category.color}-900/30`}>
                      <FileText className={`h-5 w-5 text-${category.color}-600 dark:text-${category.color}-400`} />
                    </div>
                    <Tag
                      color={category.color}
                      className="text-xs font-medium"
                    >
                      {category.name}
                    </Tag>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<Download className="h-4 w-4" />}
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();

                    }}
                  />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate mb-1">
                    {doc.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" />
                      <span>{doc.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{dayjs(doc.date).format('MMM D, YYYY')}</span>
                    </div>
                  </div>
                </div>

              </div>
            </Card>
          ));
        })}
      </div>

      {/* Empty State */}
      {selectedCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No categories selected</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Please select at least one category to view documents.
          </p>
        </div>
      )}
    </div>
  );
};





import React from 'react';

import dayjs from "dayjs";
import { DealCard } from "../../deals/components/DealCard";
import { Product } from "@/context/store/productStore";


const TrackerTab = () => {
  const [activeStatusTab, setActiveStatusTab] = useState<stages>(Stage.DISCUSSION);

  return (
    <div className="space-y-6">

      {/* Deal Status Pills */}
      <div className="flex flex-wrap gap-2">
        {MOCK_DEAL_STATUS.map(({ status, color }) => (
          <Button
            key={status}
            onClick={() => setActiveStatusTab(status)}
            type={activeStatusTab === status ? "primary" : "default"}
            style={{
              backgroundColor: activeStatusTab === status ? color : '',
              borderColor: activeStatusTab !== status ? color : ''
            }}
            className="flex items-center gap-2"
          >
            {STAGE_LABELS[status]}
            <span className="text-xs bg-opacity-30 px-2 py-0.5 rounded-full bg-white text-black dark:bg-black dark:text-white">
              {[].length || 0}
            </span>
          </Button>
        ))}
      </div>

      {/* Deal Cards for Selected Status */}
      <div className="dark:bg-blue-800/10 p-5 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Title level={3} className="!text-slate-900 dark:!text-white">{STAGE_LABELS[activeStatusTab]} Deals</Title>

        </div>

        <Row gutter={[16, 16]}>
          {[].map((deal: Deal) => (
            <Col xs={24} md={24} lg={12} xxl={8} key={deal.dealUUID}>
              <DealCard deal={deal} page={1} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

const ICBTab = () => {
  const columns = [
    {
      title: 'ICB Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Button type="link" className="p-0 h-auto font-semibold text-blue-600 dark:text-blue-400">
          {code}
        </Button>
      ),
    },
    {
      title: 'ICB Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong className="text-slate-900 dark:text-slate-200">{text}</Text>,
    },
    {
      title: 'Annual Consumption',
      dataIndex: 'consumption',
      key: 'consumption',
      render: (consumption: number) => `${consumption.toLocaleString()} units`,
    }, {
      title: 'Deal Value',
      dataIndex: 'value',
      key: 'dealvalue',
      render: (value: number) => `$${Math.round(Math.random() * 10000)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color="blue">{status}</Tag>
      ),
    },
    {
      title: 'Last Contact',
      dataIndex: 'lastContact',
      key: 'lastContact',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  return (
    <div className="space-y-6">
      <Card variant="borderless">
        <Table
          columns={columns}
          dataSource={MOCK_ICB_DATA
            .sort((a, b) => {
              if (a.priority === "green" && b.priority !== "green") return -1;
              if (a.priority !== "green" && b.priority === "green") return 1;
              return b.consumption - a.consumption;
            })
            .map((item, index) => ({ ...item, key: index }))}
          pagination={false}
        />
      </Card>
    </div>
  );
};

// Antd Modals with Enhanced Design
interface EditModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

const EditModal = ({ open, onClose, product }: EditModalProps) => {
  const [formValues, setFormValues] = useState(product);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  return (
    <Modal
      title="Edit Product"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onClose}>
          Save Changes
        </Button>,
      ]}
      width={800}
      className="dark-modal"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Product Code</label>
          <Input value={product.productCode} disabled className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Product Name</label>
          <Input
            name="productName"
            value={formValues.productName}
            onChange={handleInputChange}
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Therapeutic Area</label>
          <Input
            name="therapeuticArea"
            value={formValues.therapeuticArea}
            onChange={handleInputChange}
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
          />
        </div>
      </div>
    </Modal>
  );
};

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

const UploadModal = ({ open, onClose }: UploadModalProps) => {
  const [category, setCategory] = useState<string>("regulatory");
  const [documentName, setDocumentName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const MAX_SIZE = toByte(15, "KB");
  const handleClear = useCallback(() => {
    setFileList([]);
    toast.info("File selection cleared.");
  }, [fileList]);
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
      if (file.type !== "text/xml") {
        toast.error("Please select an XML file.");
        return false;
      }
      setFileList([file]);
      return false;
    },
    onRemove: handleClear,

  };
  return (
    <Modal
      title="Upload Document"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onClose}>
          Upload Document
        </Button>,
      ]}
      width={600}
      className="dark-modal"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Category</label>
          <Select
            value={category}
            onChange={setCategory}
            className="w-full"
            options={["regulatory", 'marketing', "clinical", "commercial"].map(d => ({ value: d, label: d }))}
          />

        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Document Name</label>
          <Input
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Enter document name"
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">File</label>
          <Space orientation="vertical" className="w-full">
            <Dragger   {...draggerProps} className=" block my-upload">
              <p className="flex place-content-center mb-4">
                <InboxIcon size={30} />
              </p>
              <p className="ant-upload-text">
                Drag and drop, or click to select a file
              </p>
              <p className="ant-upload-hint">
                Uploads are not sent automatically.
              </p>
            </Dragger>

          </Space>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Notes (Optional)</label>
          <Input.TextArea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant notes..."
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
          />
        </div>
      </div>
    </Modal>
  );
};

interface AddFieldModalProps {
  open: boolean;
  onClose: () => void;
}

const AddFieldModal = ({ open, onClose }: AddFieldModalProps) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("blue");
  const [permissions, setPermissions] = useState({
    regulatory: true,
    commercial: true,
    marketing: false,
  });

  const handlePermissionChange = (permissionKey: keyof typeof permissions) => (e: CheckboxChangeEvent) => {
    setPermissions({
      ...permissions,
      [permissionKey]: e.target.checked,
    });
  };

  return (
    <Modal
      title="Add Custom Category"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onClose}>
          Add Category
        </Button>,
      ]}
      width={600}
      className="dark-modal"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Category Name</label>
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g., Regional Compliance"
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Description</label>
          <Input.TextArea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this category..."
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Color Theme</label>
          <Radio.Group value={color} onChange={(e) => setColor(e.target.value)}>
            <Radio.Button value="blue">Blue</Radio.Button>
            <Radio.Button value="green">Green</Radio.Button>
            <Radio.Button value="purple">Purple</Radio.Button>
            <Radio.Button value="orange">Orange</Radio.Button>
            <Radio.Button value="red">Red</Radio.Button>
            <Radio.Button value="pink">Pink</Radio.Button>
          </Radio.Group>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Access Permissions</label>
          <div className="space-y-2">
            <Checkbox
              checked={permissions.regulatory}
              onChange={handlePermissionChange("regulatory")}
              className="text-slate-700 dark:text-slate-300"
            >
              Regulatory Team
            </Checkbox>
            <Checkbox
              checked={permissions.commercial}
              onChange={handlePermissionChange("commercial")}
              className="text-slate-700 dark:text-slate-300"
            >
              Commercial Team
            </Checkbox>
            <Checkbox
              checked={permissions.marketing}
              onChange={handlePermissionChange("marketing")}
              className="text-slate-700 dark:text-slate-300"
            >
              Marketing Team
            </Checkbox>
          </div>
        </div>
      </div>
    </Modal>
  );
};



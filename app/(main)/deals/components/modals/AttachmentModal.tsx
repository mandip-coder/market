import { GlobalDate } from "@/Utils/helpers";
import Label from "@/components/Label/Label";
import ModalWrapper from "@/components/Modal/Modal";
import { APIPATH } from "@/shared/constants/url";
import { AppstoreOutlined, BarsOutlined, CheckCircleOutlined, FileExcelOutlined, FileImageOutlined, FileOutlined, FilePdfOutlined, FileUnknownOutlined, FileWordOutlined, FileZipOutlined, FolderOpenOutlined, PaperClipOutlined, SearchOutlined, StarFilled, StarOutlined, UploadOutlined } from "@ant-design/icons";
import { App, Badge, Button, Empty, Input, Segmented, Tabs, Tag, Typography, Upload } from "antd";
import { UploadProps } from "antd/lib";
import { HardDrive } from "lucide-react";
import { JSX, memo, useCallback, useEffect, useMemo, useState } from "react";

const { Text, Title } = Typography;

// Types
type ViewMode = 'grid' | 'list';
type SourceType = 'server' | 'starred' | 'system';

interface Document {
  id: number;
  name: string;
  path: string;
  size: string;
  type: string;
  modified: Date;
  starred?: boolean;
}


interface AttachmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (attachments: any[]) => void;
}

// Constants
const MAX_FILE_SIZE_MB = 10;
export const FILE_ICON_MAP: Record<string, JSX.Element> = {
  pdf: <FilePdfOutlined className="!text-red-500 text-2xl" />,
  docx: <FileWordOutlined className="!text-blue-500 text-2xl" />,
  doc: <FileWordOutlined className="!text-blue-500 text-2xl" />,
  xlsx: <FileExcelOutlined className="!text-green-500 text-2xl" />,
  xls: <FileExcelOutlined className="!text-green-500 text-2xl" />,
  png: <FileImageOutlined className="!text-purple-500 text-2xl" />,
  jpg: <FileImageOutlined className="!text-purple-500 text-2xl" />,
  jpeg: <FileImageOutlined className="!text-purple-500 text-2xl" />,
  zip: <FileZipOutlined className="!text-orange-500 text-2xl" />,
  pptx: <FileOutlined className="!text-blue-500 text-2xl" />,
  ppt: <FileOutlined className="!text-blue-500 text-2xl" />,
};


interface mockProductCategory {
  id: string;
  name: string;
  documents: Document[];
}

interface mockProduct {
  productUUID: string;
  productName: string;
  description: string;
  categories: mockProductCategory[];
}
const mockProducts: mockProduct[] = [
  {
    productUUID: 'product1',
    productName: 'Apozyl-OD',
    description: 'Apozyl-OD is a medication used to treat various conditions.',
    categories: [
      {
        id: 'product1/cat1',
        name: 'User Guides',
        documents: [
          { id: 1, name: 'Getting_Started_Guide.pdf', path: '/products/crm/guides/getting-started.pdf', size: '2.5 MB', type: 'pdf', modified: new Date('2024-01-15'), starred: true },
          { id: 2, name: 'Advanced_Features_Manual.pdf', path: '/products/crm/guides/advanced-features.pdf', size: '3.2 MB', type: 'pdf', modified: new Date('2024-01-10') },
          { id: 3, name: 'Admin_Setup.pdf', path: '/products/crm/guides/admin-setup.pdf', size: '1.8 MB', type: 'pdf', modified: new Date('2024-01-08') },
          { id: 4, name: 'Integration_Handbook.pdf', path: '/products/crm/guides/integration.pdf', size: '2.1 MB', type: 'pdf', modified: new Date('2024-01-05') }
        ]
      },
      {
        id: 'product1/cat2',
        name: 'Case Studies',
        documents: [
          { id: 5, name: 'Retail_Success_Story.pdf', path: '/products/crm/cases/retail.pdf', size: '4.2 MB', type: 'pdf', modified: new Date('2024-01-12') },
          { id: 6, name: 'Healthcare_Implementation.pdf', path: '/products/crm/cases/healthcare.pdf', size: '3.8 MB', type: 'pdf', modified: new Date('2024-01-09') },
          { id: 7, name: 'Financial_Services_Case.pdf', path: '/products/crm/cases/financial.pdf', size: '2.9 MB', type: 'pdf', modified: new Date('2024-01-07') }
        ]
      },
      {
        id: 'product1/cat3',
        name: 'Technical Specs',
        documents: [
          { id: 8, name: 'API_Documentation.pdf', path: '/products/crm/tech/api.pdf', size: '5.1 MB', type: 'pdf', modified: new Date('2024-01-20'), starred: true },
          { id: 9, name: 'Database_Schema.pdf', path: '/products/crm/tech/database.pdf', size: '1.5 MB', type: 'pdf', modified: new Date('2024-01-18') },
          { id: 10, name: 'Security_Overview.pdf', path: '/products/crm/tech/security.pdf', size: '2.3 MB', type: 'pdf', modified: new Date('2024-01-15') }
        ]
      },
      {
        id: 'product1/cat4',
        name: 'Marketing Materials',
        documents: [
          { id: 11, name: 'Product_Brochure.pdf', path: '/products/crm/marketing/brochure.pdf', size: '3.7 MB', type: 'pdf', modified: new Date('2024-01-22') },
          { id: 12, name: 'Sales_Presentation.pptx', path: '/products/crm/marketing/sales-presentation.pptx', size: '8.5 MB', type: 'pptx', modified: new Date('2024-01-19') },
          { id: 13, name: 'Email_Templates.zip', path: '/products/crm/marketing/email-templates.zip', size: '1.2 MB', type: 'zip', modified: new Date('2024-01-17') }
        ]
      }
    ]
  },
  {
    productUUID: 'product2',
    productName: 'Analytics Platform',
    description: 'Analytics Platform is a data analytics and business intelligence solution.',
    categories: [
      {
        id: 'product2/cat1',
        name: 'User Guides',
        documents: [
          { id: 14, name: 'Quick_Start_Guide.pdf', path: '/products/analytics/guides/quick-start.pdf', size: '1.9 MB', type: 'pdf', modified: new Date('2024-01-14') },
          { id: 15, name: 'Dashboard_Creation.pdf', path: '/products/analytics/guides/dashboard.pdf', size: '2.7 MB', type: 'pdf', modified: new Date('2024-01-11') },
          { id: 16, name: 'Data_Connection_Manual.pdf', path: '/products/analytics/guides/data-connection.pdf', size: '3.1 MB', type: 'pdf', modified: new Date('2024-01-09') },
          { id: 17, name: 'Report_Building.pdf', path: '/products/analytics/guides/report-building.pdf', size: '2.4 MB', type: 'pdf', modified: new Date('2024-01-06') }
        ]
      },
      {
        id: 'product2/cat2',
        name: 'Case Studies',
        documents: [
          { id: 18, name: 'E-commerce_Analytics.pdf', path: '/products/analytics/cases/ecommerce.pdf', size: '4.5 MB', type: 'pdf', modified: new Date('2024-01-13') },
          { id: 19, name: 'Manufacturing_Insights.pdf', path: '/products/analytics/cases/manufacturing.pdf', size: '3.9 MB', type: 'pdf', modified: new Date('2024-01-10') },
          { id: 20, name: 'Supply_Chain_Analytics.pdf', path: '/products/analytics/cases/supply-chain.pdf', size: '4.1 MB', type: 'pdf', modified: new Date('2024-01-08') }
        ]
      },
      {
        id: 'product2/cat3',
        name: 'Technical Specs',
        documents: [
          { id: 21, name: 'Data_Model.pdf', path: '/products/analytics/tech/data-model.pdf', size: '2.8 MB', type: 'pdf', modified: new Date('2024-01-19'), starred: true },
          { id: 22, name: 'ETL_Processes.pdf', path: '/products/analytics/tech/etl.pdf', size: '3.3 MB', type: 'pdf', modified: new Date('2024-01-16') },
          { id: 23, name: 'Performance_Guide.pdf', path: '/products/analytics/tech/performance.pdf', size: '1.7 MB', type: 'pdf', modified: new Date('2024-01-14') }
        ]
      },
      {
        id: 'product2/cat4',
        name: 'Marketing Materials',
        documents: [
          { id: 24, name: 'Analytics_Brochure.pdf', path: '/products/analytics/marketing/brochure.pdf', size: '4.2 MB', type: 'pdf', modified: new Date('2024-01-21') },
          { id: 25, name: 'ROI_Calculator.xlsx', path: '/products/analytics/marketing/roi-calculator.xlsx', size: '1.1 MB', type: 'xlsx', modified: new Date('2024-01-18') },
          { id: 26, name: 'Demo_Videos.zip', path: '/products/analytics/marketing/demo-videos.zip', size: '15.3 MB', type: 'zip', modified: new Date('2024-01-15') }
        ]
      }
    ]
  },
  {
    productUUID: 'product3',
    productName: 'Project Management Suite',
    description: 'Project Management Suite is a comprehensive project management solution.',
    categories: [
      {
        id: 'product3/cat1',
        name: 'User Guides',
        documents: [
          { id: 27, name: 'PM_Suite_Overview.pdf', path: '/products/pm/guides/overview.pdf', size: '2.2 MB', type: 'pdf', modified: new Date('2024-01-16') },
          { id: 28, name: 'Team_Collaboration.pdf', path: '/products/pm/guides/collaboration.pdf', size: '1.8 MB', type: 'pdf', modified: new Date('2024-01-13') },
          { id: 29, name: 'Resource_Management.pdf', path: '/products/pm/guides/resources.pdf', size: '2.5 MB', type: 'pdf', modified: new Date('2024-01-11') },
          { id: 30, name: 'Time_Tracking.pdf', path: '/products/pm/guides/time-tracking.pdf', size: '1.6 MB', type: 'pdf', modified: new Date('2024-01-09') }
        ]
      },
      {
        id: 'product3/cat2',
        name: 'Case Studies',
        documents: [
          { id: 31, name: 'Software_Development.pdf', path: '/products/pm/cases/software-dev.pdf', size: '3.7 MB', type: 'pdf', modified: new Date('2024-01-15') },
          { id: 32, name: 'Construction_Project.pdf', path: '/products/pm/cases/construction.pdf', size: '4.3 MB', type: 'pdf', modified: new Date('2024-01-12') },
          { id: 33, name: 'Marketing_Campaign.pdf', path: '/products/pm/cases/marketing.pdf', size: '3.1 MB', type: 'pdf', modified: new Date('2024-01-10') }
        ]
      },
      {
        id: 'product3/cat3',
        name: 'Technical Specs',
        documents: [
          { id: 34, name: 'API_Reference.pdf', path: '/products/pm/tech/api.pdf', size: '4.8 MB', type: 'pdf', modified: new Date('2024-01-20'), starred: true },
          { id: 35, name: 'Workflow_Engine.pdf', path: '/products/pm/tech/workflow.pdf', size: '2.9 MB', type: 'pdf', modified: new Date('2024-01-17') },
          { id: 36, name: 'Notification_System.pdf', path: '/products/pm/tech/notifications.pdf', size: '1.9 MB', type: 'pdf', modified: new Date('2024-01-14') }
        ]
      },
      {
        id: 'product3/cat4',
        name: 'Marketing Materials',
        documents: [
          { id: 37, name: 'PM_Suite_Brochure.pdf', path: '/products/pm/marketing/brochure.pdf', size: '3.5 MB', type: 'pdf', modified: new Date('2024-01-22') },
          { id: 38, name: 'Feature_Comparison.pdf', path: '/products/pm/marketing/comparison.pdf', size: '2.1 MB', type: 'pdf', modified: new Date('2024-01-19') },
          { id: 39, name: 'Customer_Testimonials.pdf', path: '/products/pm/marketing/testimonials.pdf', size: '3.8 MB', type: 'pdf', modified: new Date('2024-01-17') },
          { id: 40, name: 'Pricing_Sheets.zip', path: '/products/pm/marketing/pricing.zip', size: '1.3 MB', type: 'zip', modified: new Date('2024-01-15') }
        ]
      }
    ]
  }
];

// Helper functions
const getFileIcon = (type: string): JSX.Element => {
  return FILE_ICON_MAP[type?.toLowerCase()] || <FileUnknownOutlined className="!text-gray-500 text-2xl" />;
};

const filterDocuments = (documents: Document[], searchTerm: string): Document[] => {
  if (!searchTerm) return documents;
  return documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Reusable Components
const DocumentItem = memo(({
  doc,
  isSelected,
  viewMode,
  onSelect,
  onStarToggle,
  showStar = true
}: {
  doc: Document;
  isSelected: boolean;
  viewMode: ViewMode;
  onSelect: (doc: Document) => void;
  onStarToggle: (docId: number, e: React.MouseEvent) => void;
  showStar?: boolean;
}) => {
  const handleClick = useCallback(() => onSelect(doc), [doc, onSelect]);

  const commonClasses = `transition-all ${isSelected
    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
    : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

  if (viewMode === 'grid') {
    return (
      <div
        className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer relative ${commonClasses}`}
        onClick={handleClick}
      >
        {showStar && (
          <button
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => onStarToggle(doc.id, e)}
          >
            {doc.starred ? (
              <StarFilled className="!text-yellow-500 text-sm" />
            ) : (
              <StarOutlined className="!text-gray-400 text-sm" />
            )}
          </button>
        )}
        <div className="mb-2">{getFileIcon(doc.type)}</div>
        <Text className="text-center text-sm truncate w-full" ellipsis>{doc.name}</Text>
        <Text type="secondary" className="text-xs">{doc.size}</Text>
        {isSelected && (
          <CheckCircleOutlined className="absolute bottom-2 right-2 text-blue-500" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center p-3 border rounded-lg cursor-pointer ${commonClasses}`}
      onClick={handleClick}
    >
      <div className="mr-3">{getFileIcon(doc.type)}</div>
      <div className="flex-1 min-w-0">
        <Text className="text-sm font-medium truncate block">{doc.name}</Text>
        <Text type="secondary" className="text-xs">{doc.size} • {GlobalDate(doc.modified.toISOString())}</Text>
      </div>
      {showStar && (
        <button
          className="p-1 ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={(e) => onStarToggle(doc.id, e)}
        >
          {doc.starred ? (
            <StarFilled className="!text-yellow-500" />
          ) : (
            <StarOutlined className="!text-gray-400" />
          )}
        </button>
      )}
      {isSelected && (
        <CheckCircleOutlined className="ml-2 text-blue-500" />
      )}
    </div>
  );
});

const DocumentView = memo(({
  documents,
  viewMode,
  selectedDocs,
  searchTerm,
  onDocumentSelect,
  onStarToggle,
  showStar = true
}: {
  documents: Document[];
  viewMode: ViewMode;
  selectedDocs: Document[];
  searchTerm: string;
  onDocumentSelect: (doc: Document) => void;
  onStarToggle: (docId: number, e: React.MouseEvent) => void;
  showStar?: boolean;
}) => {
  const filteredDocuments = useMemo(() =>
    filterDocuments(documents, searchTerm),
    [documents, searchTerm]
  );

  if (filteredDocuments.length === 0) {
    return (
      <Empty
        description="No documents found"
        className="mt-12"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const containerClass = viewMode === 'grid'
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    : "space-y-2";

  return (
    <div className={containerClass}>
      {filteredDocuments.map(doc => (
        <DocumentItem
          key={doc.id}
          doc={doc}
          isSelected={!!selectedDocs.find(d => d.id === doc.id)}
          viewMode={viewMode}
          onSelect={onDocumentSelect}
          onStarToggle={onStarToggle}
          showStar={showStar}
        />
      ))}
    </div>
  );
});

const SelectedItems = memo(({
  selectedDocs,
  uploadedFiles,
  onClearAll,
  onRemoveDoc,
  onRemoveFile
}: {
  selectedDocs: Document[];
  uploadedFiles: any[];
  onClearAll: () => void;
  onRemoveDoc: (docId: number) => void;
  onRemoveFile: (fileUid: string) => void;
}) => {
  const totalSelectedCount = selectedDocs.length + uploadedFiles.length;

  if (totalSelectedCount === 0) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
      <div className="flex items-center justify-between mb-2">
        <Label text="Selected Items" />
        <Button type="text" size="small" onClick={onClearAll}>
          Clear All
        </Button>
      </div>
      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
        {selectedDocs.map(doc => (
          <Tag
            key={`doc-${doc.id}`}
            closable
            onClose={() => onRemoveDoc(doc.id)}
            icon={getFileIcon(doc.type)}
            className="text-xs p-1 m-1"
          >
            {doc.name.length > 15 ? `${doc.name.substring(0, 15)}...` : doc.name}
          </Tag>
        ))}
        {uploadedFiles.map(file => (
          <Tag
            key={`file-${file.uid}`}
            closable
            onClose={() => onRemoveFile(file.uid)}
            icon={<UploadOutlined />}
            className="text-xs p-1 m-1"
          >
            {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
          </Tag>
        ))}
      </div>
    </div>
  );
});

const ViewModeToggle = memo(({
  viewMode,
  onChange
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  return (
    <Segmented<ViewMode>
      options={[
        { value: 'list', icon: <BarsOutlined /> },
        { value: 'grid', icon: <AppstoreOutlined /> },
      ]}
      value={viewMode}
      onChange={onChange}
    />
  );
});

// Main Component
const AttachmentModal = memo(({ visible, onClose, onSelect }: AttachmentModalProps) => {
  const { message } = App.useApp();
  const [selectedSource, setSelectedSource] = useState<SourceType>('system');
  const [selectedDocs, setSelectedDocs] = useState<Document[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [documents, setDocuments] = useState<Document[]>([]);

  // Initialize documents from mock data
  useEffect(() => {
    const allDocs: Document[] = [];
    mockProducts.forEach(product => {
      product.categories.forEach(category => {
        category.documents.forEach(doc => {
          allDocs.push(doc);
        });
      });
    });
    setDocuments(allDocs);
  }, []);

  // Memoized values
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return mockProducts.find(product => product.productUUID === selectedProductId);
  }, [selectedProductId]);

  const selectedCategory = useMemo(() => {
    if (!selectedProduct || !selectedCategoryId) return null;
    return selectedProduct.categories.find(category => category.id === selectedCategoryId);
  }, [selectedProduct, selectedCategoryId]);

  const starredDocuments = useMemo(() => {
    return documents.filter(doc => doc.starred);
  }, [documents]);

  const totalSelectedCount = selectedDocs.length + uploadedFiles.length;

  // Event handlers
  const handleDocumentSelect = useCallback((doc: Document) => {
    const exists = selectedDocs.find(d => d.id === doc.id);
    if (exists) {
      setSelectedDocs(selectedDocs.filter(d => d.id !== doc.id));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  }, [selectedDocs]);

  const handleStarToggle = useCallback((docId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === docId ? { ...doc, starred: !doc.starred } : doc
      )
    );

    setSelectedDocs(prevDocs =>
      prevDocs.map(doc =>
        doc.id === docId ? { ...doc, starred: !doc.starred } : doc
      )
    );
  }, []);

  const handleProductClick = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setSelectedCategoryId(null);
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleBackToProducts = useCallback(() => {
    setSelectedProductId(null);
    setSelectedCategoryId(null);
  }, []);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategoryId(null);
  }, []);

  const handleConfirm = useCallback(() => {
    const serverAttachments = selectedDocs.map(doc => ({
      filename: doc.name,
      url: doc.path,
      filePath: doc.path,
      size: parseFloat(doc.size) || 0,
      mimeType: doc.type
    }));

    const uploadedAttachments = uploadedFiles
      .filter(file => file.status === 'done' && file.response)
      .map(file => ({
        filename: file.response.originalFileName || file.name,
        url: file.response.fileUrl || "",
        filePath: file.response.filePath || "",
        size: file.response.fileSize || file.size || 0,
        mimeType: file.response.fileType || file.type || "application/octet-stream",
        storageType: file.response.storageType
      }));

    onSelect([...serverAttachments, ...uploadedAttachments]);

    // Reset states
    setSelectedDocs([]);
    setUploadedFiles([]);
    setSelectedProductId(null);
    setSelectedCategoryId(null);
    onClose();
  }, [selectedDocs, uploadedFiles, onSelect, onClose]);

  const removeSelectedDoc = useCallback((docId: number) => {
    setSelectedDocs(selectedDocs.filter(d => d.id !== docId));
  }, [selectedDocs]);

  const removeUploadedFile = useCallback((fileUid: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.uid !== fileUid));
  }, [uploadedFiles]);

  const clearAll = useCallback(() => {
    setSelectedDocs([]);
    setUploadedFiles([]);
  }, []);

  // Upload props
  const uploadProps: UploadProps = {
    multiple: true,
    action: APIPATH.FILEUPLOAD,
    data: {
      moduleName: "email",
    },
    maxCount: 10,
    fileList: uploadedFiles,
    beforeUpload: (file: File) => {
      const isLt10M = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
      if (!isLt10M) {
        message.error(`File must be smaller than ${MAX_FILE_SIZE_MB}MB!`);
        return false;
      }
      return true;
    },
    onChange: (info: any) => {
      setUploadedFiles(info.fileList);
    },
  };

  // Render components
  const renderProductsView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {mockProducts.map(product => (
        <div
          key={product.productUUID}
          className="flex flex-col p-4 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          onClick={() => handleProductClick(product.productUUID)}
        >
          <div className="text-4xl text-blue-500 mb-2 text-center">
            <AppstoreOutlined />
          </div>
          <Title level={5} className="text-center m-2">{product.productName}</Title>
          <Text type="secondary" className="text-center text-xs">{product.description}</Text>
        </div>
      ))}
    </div>
  );

  const renderCategoriesView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {selectedProduct?.categories.map(category => (
        <div
          key={category.id}
          className="flex flex-col p-4 border border-gray-200 rounded-lg cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          onClick={() => handleCategoryClick(category.id)}
        >
          <div className="text-3xl text-green-500 mb-2 text-center">
            <FolderOpenOutlined />
          </div>
          <Title level={5} className="text-center m-2">{category.name}</Title>
          <Text type="secondary" className="text-center text-xs">
            {category.documents.length} documents
          </Text>
        </div>
      ))}
    </div>
  );

  const renderDocumentsView = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search documents..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          allowClear
          className="max-w-xs"
        />
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>
      <DocumentView
        documents={selectedCategory?.documents || []}
        viewMode={viewMode}
        selectedDocs={selectedDocs}
        searchTerm={searchTerm}
        onDocumentSelect={handleDocumentSelect}
        onStarToggle={handleStarToggle}
      />
    </div>
  );

  const renderStarredView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search starred documents..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          allowClear
          className="max-w-xs"
        />
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>
      <DocumentView
        documents={starredDocuments}
        viewMode={viewMode}
        selectedDocs={selectedDocs}
        searchTerm={searchTerm}
        onDocumentSelect={handleDocumentSelect}
        onStarToggle={handleStarToggle}
      />
    </div>
  );

  const renderSystemUploadView = () => (
    <div className="space-y-4">
      <Upload.Dragger {...uploadProps} className="p-8">
        <p className="ant-upload-drag-icon">
          <UploadOutlined className="text-5xl text-blue-500" />
        </p>
        <p className="ant-upload-text">Click or drag files to upload</p>
        <p className="ant-upload-hint">
          Support for single or bulk upload. Max file size: {MAX_FILE_SIZE_MB}MB
        </p>
      </Upload.Dragger>
    </div>
  );

  // Tab items
  const tabItems = [
    // {
    //   key: 'server',
    //   label: (
    //     <span className="flex items-center gap-2">
    //       <FolderOutlined />
    //       Server Documents
    //       {selectedDocs.length > 0 && (
    //         <Badge count={selectedDocs.length} size="small" />
    //       )}
    //     </span>
    //   ),
    //   children: (
    //     <div className="space-y-4">
    //       <div className="flex items-center">
    //         <Breadcrumb
    //           items={[
    //             {
    //               title: (
    //                 <span onClick={handleBackToProducts} className="cursor-pointer">
    //                   Products
    //                 </span>
    //               ),
    //               key: 'products',
    //             },
    //             ...(selectedProduct ? [{
    //               title: (
    //                 <span onClick={handleBackToCategories} className="cursor-pointer">
    //                   {selectedProduct.productName}
    //                 </span>
    //               ),
    //               key: 'product',
    //             }] : []),
    //             ...(selectedCategory ? [{
    //               title: selectedCategory.name,
    //               key: 'category',
    //             }] : [])
    //           ]}
    //           separator={<RightOutlined />}
    //           className="mb-4"
    //         />
    //       </div>

    //       {loading ? (
    //         <div className="text-center p-12">
    //           <Spin size="large" />
    //         </div>
    //       ) : (
    //         <div>
    //           {!selectedProduct && renderProductsView()}
    //           {selectedProduct && !selectedCategory && renderCategoriesView()}
    //           {selectedCategory && renderDocumentsView()}
    //         </div>
    //       )}
    //     </div>
    //   ),
    // },
    // {
    //   key: 'starred',
    //   label: (
    //     <span className="flex items-center gap-2">
    //       <StarFilled className='!text-yellow-500' />
    //       Starred Documents
    //       {starredDocuments.length > 0 && (
    //         <Badge count={starredDocuments.length} size="small" />
    //       )}
    //     </span>
    //   ),
    //   children: renderStarredView(),
    // },
    {
      key: 'system',
      label: (
        <span className="flex items-center gap-2">
          <HardDrive />
          System Upload
          {uploadedFiles.length > 0 && (
            <Badge count={uploadedFiles.length} size="small" />
          )}
        </span>
      ),
      children: renderSystemUploadView(),
    },
  ];

  return (
    <ModalWrapper
      title={
        <div className="flex items-center gap-2">
          <PaperClipOutlined />
          <span>Add Attachments</span>
        </div>
      }
      destroyOnHidden
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalSelectedCount} items selected
          </span>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={totalSelectedCount === 0}
            >
              Add Attachments
            </Button>
          </div>
        </div>
      }
      className="dark:bg-gray-800"
    >
      <SelectedItems
        selectedDocs={selectedDocs}
        uploadedFiles={uploadedFiles}
        onClearAll={clearAll}
        onRemoveDoc={removeSelectedDoc}
        onRemoveFile={removeUploadedFile}
      />

      <Tabs
        activeKey={selectedSource}
        onChange={(value) => setSelectedSource(value as SourceType)}
        items={tabItems}
      />
    </ModalWrapper>
  );
});

export default AttachmentModal;
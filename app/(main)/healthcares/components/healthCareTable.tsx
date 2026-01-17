import { useTableScroll } from "@/hooks/useTableScroll";
import { GlobalDate } from "@/Utils/helpers";
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Button } from "antd";
import { Building2, Eye, Globe, Phone } from "lucide-react";
import { Healthcare } from "../services/types";

export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'Hospital': 'blue',
    'Clinic': 'green',
    'Pharmacy': 'purple',
    'Laboratory': 'orange',
    'Diagnostic Center': 'cyan',
    'Nursing Home': 'magenta',
  };
  return colorMap[type] || 'default';
};


interface HealthcareTableProps {
  data: Healthcare[];
  loading: boolean;
  onViewDetails: (healthcare: Healthcare) => void;
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
  page: number;
  pageSize: number;
  totalCount: number;
}

export const HealthcareTable = ({
  data,
  loading,
  onViewDetails,
  onTableChange,
  page,
  pageSize,
  totalCount
}: HealthcareTableProps) => {
  const columns: ProColumns<Healthcare>[] = [
    {
      title: 'Code',
      dataIndex: 'healthcareCode',
      key: 'healthcareCode',
      width: 120,
      sorter: true,
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
            <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-medium text-sm">{text || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'hcoName',
      key: 'hcoName',
      width: 200,
      sorter: true,
      render: (text) => (
        <div className="font-medium">{text}</div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'hcoType',
      key: 'hcoType',
      width: 120,
      render: (text) => (
        <Badge color={getTypeColor(text as string)}>
          {text}
        </Badge>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      render: (text) => (
        <Badge 
          color={text === 'Active' ? 'green' : 'red'}
          text={text}
        />
      ),
    },
    {
      title: 'Contact Info',
      dataIndex: 'phone1',
      key: 'phone1',
      width: 180,
      render: (_, record) => (
        <div>
          {record.phone1 && (
            <div className="flex items-center gap-1 mb-1">
              <Phone className="h-3 w-3 text-slate-400" />
              <span className="text-sm">{record.phone1}</span>
            </div>
          )}
          {record.website && (
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-slate-400" />
              <a 
                href={record.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate max-w-[150px]"
              >
                {record.website}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'city',
      key: 'city',
      width: 150,
      render: (text) => (
        <div className="text-sm">{text || 'N/A'}</div>
      ),
    },
    {
      title: 'Contacts',
      dataIndex: 'totalContactsCount',
      key: 'totalContactsCount',
      width: 100,
      sorter: true,
      render: (text, record) => (
        <div className="text-sm">
          <span className="font-medium text-green-600">{record.totalActiveContactsCount || 0}</span>
          <span className="text-slate-400"> / {text || 0}</span>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      render: (text) => (
        <div className="text-sm">{GlobalDate(text as string)}</div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<Eye className="h-3.5 w-3.5" />}
          onClick={() => onViewDetails(record)}
        />
      ),
    },
  ];
  const { scrollY, tableWrapperRef } = useTableScroll();

  return (
    <div ref={tableWrapperRef}>
      <ProTable<Healthcare>
        columns={columns}
        dataSource={data}
        rowKey="hcoUUID"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showQuickJumper: true,
        }}
        onChange={onTableChange}
        search={false}
        options={{
          density: true,
          fullScreen: true,
          reload: false,
          setting: true,
        }}
        scroll={{ x: 1200, y: scrollY }}
        dateFormatter="string"
        headerTitle={false}
      />
    </div>
  );
};
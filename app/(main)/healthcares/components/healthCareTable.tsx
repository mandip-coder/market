import { Button, Badge } from "antd";
import { Eye, Phone, Globe } from "lucide-react";
import { BankOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Healthcare } from "../lib/types";
import { HEALTHCARE_TYPES, RAG_RATINGS } from "../lib/constants";
import { formatDate, getRatingColor, getTypeColor } from "../lib/utils";
import { useTableScroll } from "@/hooks/useTableScroll";

interface HealthcareTableProps {
  data: Healthcare[];
  loading: boolean;
  onViewDetails: (healthcare: Healthcare) => void;
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
  tableParams: any;
}

export const HealthcareTable = ({
  data,
  loading,
  onViewDetails,
  onTableChange,
  tableParams
}: HealthcareTableProps) => {
  const columns: ProColumns<Healthcare>[] = [
    {
      title: 'ID',
      dataIndex: 'hcoUUID',
      key: 'hcoUUID',
      width: 80,
      sorter: true,
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
            <BankOutlined className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-medium text-sm">#{text}</span>
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
      filters: true,
      valueEnum: HEALTHCARE_TYPES.reduce((acc, type) => {
        acc[type] = { text: type };
        return acc;
      }, {} as Record<string, { text: string }>),
      render: (text) => (
        <Badge color={getTypeColor(text as string)}>
          {text}
        </Badge>
      ),
    },
    {
      title: 'RAG Rating',
      dataIndex: 'ragRating',
      key: 'ragRating',
      width: 120,
      filters: true,
      valueEnum: RAG_RATINGS.reduce((acc, rating) => {
        acc[rating] = { text: rating };
        return acc;
      }, {} as Record<string, { text: string }>),
      render: (text) => text ? (
        <Badge color={getRatingColor(text as string)}>
          {text}
        </Badge>
      ) : (
        <span className="text-xs text-slate-400">Not set</span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone1',
      key: 'phone1',
      width: 150,
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
              <span className="text-sm truncate">{record.website}</span>
            </div>
          )}
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
        <div className="text-sm">{formatDate(text as string)}</div>
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
  const {scrollY,tableWrapperRef,}=useTableScroll()

  return (
    <div ref={tableWrapperRef}>
    <ProTable<Healthcare>
      columns={columns}
      dataSource={data}
      rowKey="hcoUUID"
      loading={loading}
      pagination={{
        current: tableParams.pagination.current,
        pageSize: tableParams.pagination.pageSize,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
      }}
      onChange={onTableChange}
      search={false}
      options={{
        density: true,
        fullScreen: true,
        reload: () => {},
        setting: true,
      }}
      scroll={{ x: 800,y:scrollY }}
      dateFormatter="string"
      headerTitle={false}
    />
    </div>
  );
};
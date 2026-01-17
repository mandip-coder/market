import { useTableScroll } from "@/hooks/useTableScroll";
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Button, Tag } from "antd";
import { Activity, Eye, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Deal } from "../services/deals.types";
import { formatUserDisplay, getStageColor, GlobalDate } from "@/Utils/helpers";
import { useDropdownDealStages } from "@/services/dropdowns/dropdowns.hooks";
import { useLoginUser } from "@/hooks/useToken";

interface DealsTableProps {
  data: Deal[];
  loading: boolean;
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
  page: number;
  pageSize: number;
  totalCount: number;
}


export const DealsTable = ({
  data,
  loading,
  onTableChange,
  page,
  pageSize,
  totalCount
}: DealsTableProps) => {
  const router = useRouter();
  const user=useLoginUser()  
  const handleViewDetails = (deal: Deal) => {
    router.push(`/deals/${deal.dealUUID}`);
  };

  const columns: ProColumns<Deal>[] = [
    {
      title: 'Deal Name',
      dataIndex: 'dealName',
      key: 'dealName',
      width: 250,
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
            <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-medium truncate text-sm">{text || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Healthcare',
      dataIndex: 'hcoName',
      key: 'hcoName',
      width: 180,
      render: (text) => (
        <div className="font-medium text-sm">{text}</div>
      ),
    },
    {
      title: 'Stage',
      dataIndex: 'dealStageName',
      key: 'dealStageName',
      width: 130,
      render: (stageName) => {
        return (
          <Badge 
            color={getStageColor(stageName as string)}
            text={stageName}
          />
        );
      },
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
      width: 250,
      ellipsis: true,
      render: (text) => (
        <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
          {text || 'No summary'}
        </div>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 190,
      render: (text, record) => (<>
        <p className="text-sm font-bold">{formatUserDisplay(record.createdBy, record.createdUUID,user?.userUUID)}</p>
        <p className="text-sm">{GlobalDate(text as string)}</p> 
      </>
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
          onClick={() => handleViewDetails(record)}
        />
      ),
    },
  ];

  const { scrollY, tableWrapperRef } = useTableScroll();

  return (
    <div ref={tableWrapperRef}>
      <ProTable<Deal>
        columns={columns}
        dataSource={data}
        rowKey="dealUUID"
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
        scroll={{ x: 1400, y: scrollY }}
        dateFormatter="string"
        headerTitle={false}
      />
    </div>
  );
};

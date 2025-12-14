'use client'
import { useTableScroll } from "@/hooks/useTableScroll";
import { ReloadOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import { CardHeader } from "../CardHeader/CardHeader";
export default function DataTableSkeleton() {
  const {scrollY,tableWrapperRef}=useTableScroll()
  return (
    <div ref={tableWrapperRef} className="">
        <ProTable<any>
          bordered
          defaultSize="small"
          manualRequest
          className="pro-table-customize"
          rowSelection={{
            type: "checkbox",
          }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          options={{
            fullScreen: true,
            reloadIcon: <ReloadOutlined spin={true} />,
          }}

          search={false}
          headerTitle={<CardHeader title="Users List" />}
          scroll={{ x: 1200, y: scrollY }}
          sticky
          loading={{
            spinning: true,
            tip: "Loading...",
            indicator: <ReloadOutlined spin={true} />,
            size: "large",
          }}
        />
      </div>
  );
}
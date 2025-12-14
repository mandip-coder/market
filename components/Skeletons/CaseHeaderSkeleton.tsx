import React from 'react';
import { Skeleton, Button, Tooltip, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { TriangleAlert } from 'lucide-react';

type Props = {
  handleBack: any
  error?: string|null
}
export default function CaseHeaderSkeleton({ handleBack, error }: Props) {
  if (error) {
    return <div className="sticky top-0 bg-white dark:bg-black border-0 border-slate-200 dark:border-gray-800">
      <div className="w-full mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center w-full">
            <Alert
              message={error||"Something went wrong."}
              description="There was an error loading the case header."
              type="error"
              icon={<TriangleAlert />}
              showIcon
              className="w-full"
            />
          </div>
          <Tooltip title="Back To All Cases" placement="bottom">
            <Button
              onClick={handleBack}
              icon={<ArrowLeftOutlined className="text-slate-600 dark:text-slate-400" />}
            >
              Back
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  }
  return (
    <div className="sticky top-0 bg-white dark:bg-black border-0 border-slate-200 dark:border-gray-800">
      <div className="max-w-8xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3 mb-2">
                <Skeleton.Input active size="small" style={{ width: 120 }} />
                <Skeleton.Button active size="small" shape="round" />
                <Skeleton.Button active size="small" shape="round" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center space-x-1">
                  <Skeleton.Avatar active size="small" />
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton.Avatar active size="small" />
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton.Avatar active size="small" />
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                </div>
              </div>
            </div>
          </div>

          <Tooltip title="Back To All Cases" placement="bottom">
            <Button
              onClick={handleBack}
              icon={<ArrowLeftOutlined className="text-slate-600 dark:text-slate-400" />}
            >
              Back
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Skeleton } from 'antd';

type Props = {
  error?: string | null
}

export default function CaseFooterSkeleton({ error }: Props) {


  return (
    <div className="bg-white dark:bg-black z-50">
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center space-x-2">{
          error ? <div className="text-red-500">{error}</div> : <>
            <Skeleton.Button active size="small" shape="round" style={{ width: 80 }} />
            <Skeleton.Button active size="small" shape="round" style={{ width: 100 }} />
            <Skeleton.Button active size="small" shape="round" style={{ width: 120 }} />
          </>}
        </div>
      </div>
    </div>
  );
}
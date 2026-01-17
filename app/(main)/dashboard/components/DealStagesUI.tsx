"use client";

import { useDealStagesQuery } from "@/app/(main)/dashboard/services/dashboard.hooks";
import StageSkeleton from "@/components/Skeletons/StageSkeleton";
import { Badge } from "antd";

export default function DealStagesUI() {
  const { data: stages, isLoading, isError, error } = useDealStagesQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <StageSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load deal stages: {error?.message}
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No deal stages found</div>
    );
  }

  return (
    <>
      {stages.map(({ stageName, stageCount }, index) => (
        <div
          key={stageName}
          className="flex items-center justify-between p-3   rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {index + 1}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {stageName}
            </span>
          </div>
          <Badge count={stageCount} color="orange" />
        </div>
      ))}
    </>
  );
}

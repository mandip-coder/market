"use client";

import { dealsService } from "@/app/(main)/deals/services/deals.service";
import { useMutation } from "@tanstack/react-query";
import { Button } from "antd";
import { DollarSign, RefreshCw } from "lucide-react";
import { toast } from '@/components/AppToaster/AppToaster';
import {
  useDashboardDealFollowUps,
  useInvalidateDashboardFollowUps,
} from "../services/dashboard.hooks";
import { GenericFollowupsWidget } from "./GenericFollowupsWidget";

export default function DealFollowupsWidget() {
  const { data: followups = [], isLoading, error, isRefetching } = useDashboardDealFollowUps();
  const { invalidateDealFollowUps } = useInvalidateDashboardFollowUps();

  // Custom mutations for dashboard
  const completeMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: any }) =>
      dealsService.completeFollowUp(uuid, data),
    onSuccess: () => {
      toast.success("Deal follow-up completed");
      invalidateDealFollowUps();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: any }) =>
      dealsService.cancelFollowUp(uuid, data.cancellationReason),
    onSuccess: () => {
      toast.success("Deal follow-up cancelled");
      invalidateDealFollowUps();
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: any }) =>
      dealsService.rescheduleFollowUp(uuid, data),
    onSuccess: () => {
      toast.success("Deal follow-up rescheduled");
      invalidateDealFollowUps();
    },
  });

  const header = (
    <div className="flex items-center justify-between gap-2 w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-blue-500" />
        Upcoming Deal Follow Ups
      </h2>
      <Button type="default" size="small" onClick={() => invalidateDealFollowUps()}>
        <RefreshCw size={15} className={`${isLoading || isRefetching ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );

  return (
    <GenericFollowupsWidget
      title={header}
      followups={followups}
      isLoading={isLoading}
      error={error}
      variant="deal"
      onComplete={(uuid, data) => completeMutation.mutate({ uuid, data })}
      onCancel={(uuid, data) => cancelMutation.mutate({ uuid, data })}
      onReschedule={(uuid, data) => rescheduleMutation.mutate({ uuid, data })}
      isCompleting={completeMutation.isPending}
      isCanceling={cancelMutation.isPending}
      isRescheduling={rescheduleMutation.isPending}
    />
  );
}

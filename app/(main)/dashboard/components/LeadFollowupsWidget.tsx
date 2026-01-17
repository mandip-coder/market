"use client";

import { RefreshCw, User } from "lucide-react";
import { toast } from '@/components/AppToaster/AppToaster';
import {
  useDashboardLeadFollowUps,
  useInvalidateDashboardFollowUps,
} from "../services/dashboard.hooks";

// Separated component to allow hooks to be cleaner if needed, but here mostly for clarity
import { leadsService } from "@/app/(main)/leads/services/leads.service";
import { useMutation } from "@tanstack/react-query";
import { Button } from "antd";
import { DashboardFollowUp } from "../services/dashboard.types";
import { GenericFollowupsWidget } from "./GenericFollowupsWidget";

export default function LeadFollowupsWidget() {
  const {
    data: followups = [],
    isLoading,
    error,
    isRefetching,
  } = useDashboardLeadFollowUps();

  const { invalidateLeadFollowUps } = useInvalidateDashboardFollowUps();

  return (
    <LeadFollowupsWidgetContent
      followups={followups}
      isLoading={isLoading}
      isRefetching={isRefetching}
      invalidate={invalidateLeadFollowUps}
      error={error}
    />
  );
}

function LeadFollowupsWidgetContent({
  followups,
  isLoading,
  isRefetching,
  invalidate,
  error,
}: {
  followups: DashboardFollowUp[];
  isLoading: boolean;
  isRefetching: boolean;
  invalidate: () => void;
  error: any;
}) {
  const completeMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: any }) =>
      leadsService.completeFollowUp(uuid, data),
    onSuccess: () => {
      toast.success("Follow-up completed");
      invalidate();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: any }) =>
      leadsService.cancelFollowUp(uuid, data.cancellationReason),
    onSuccess: () => {
      toast.success("Follow-up cancelled");
      invalidate();
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: any }) =>
      leadsService.rescheduleFollowUp(uuid, data),
    onSuccess: () => {
      toast.success("Follow-up rescheduled");
      invalidate();
    },
  });

  const header = (
    <div className="flex items-center justify-between gap-2 w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <User className="h-5 w-5 text-blue-500" />
        Upcoming Lead Follow Ups
      </h2>
      <Button type="default" size="small" onClick={() => invalidate()}>
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
      variant="lead"
      onComplete={(uuid, data) => completeMutation.mutate({ uuid, data })}
      onCancel={(uuid, data) => cancelMutation.mutate({ uuid, data })}
      onReschedule={(uuid, data) => rescheduleMutation.mutate({ uuid, data })}
      isCompleting={completeMutation.isPending}
      isCanceling={cancelMutation.isPending}
      isRescheduling={rescheduleMutation.isPending}
    />
  );
}

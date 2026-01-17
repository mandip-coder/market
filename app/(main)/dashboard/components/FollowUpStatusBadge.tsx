import {
  FollowUpModes,
  FollowUpModesEnum,
} from "@/components/shared/modals/FollowUpModal";
import { FollowUP, followUpStatus } from "@/lib/types";
import { Tag, Tooltip } from "antd";

interface FollowUpStatusBadgeProps {
  status: followUpStatus;
  followUp: FollowUP; // Needed for tooltips content (reason/outcome)
}

export const FollowUpStatusBadge = ({
  status,
  followUp,
}: FollowUpStatusBadgeProps) => {
  if (status === "Completed") {
    return (
      <Tooltip
        title={followUp.outcome ? "Outcome: " + followUp.outcome : "Completed"}
      >
        <Tag color="green" className="mr-0">
          Completed
        </Tag>
      </Tooltip>
    );
  }
  if (status === "Cancelled") {
    return (
      <Tooltip
        title={
          followUp.cancellationReason
            ? "Reason: " + followUp.cancellationReason
            : "Cancelled"
        }
      >
        <Tag color="red" className="mr-0">
          Cancelled
        </Tag>
      </Tooltip>
    );
  }
  if (status === "Overdue") {
    return (
      <Tag color="orange" className="mr-0">
        Overdue
      </Tag>
    );
  }
  if (status === "Rescheduled") {
    return (
      <Tooltip
        title={
          followUp.nextFollowUpNotes
            ? "Reason: " + followUp.nextFollowUpNotes
            : "Rescheduled"
        }
      >
        <Tag color="purple" className="mr-0">
          Rescheduled
        </Tag>
      </Tooltip>
    );
  }
  return (
      <Tag color="blue" className="mr-0">
        Scheduled
      </Tag>
  );
};

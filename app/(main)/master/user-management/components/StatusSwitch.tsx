import { UnlockOutlined } from "@ant-design/icons";
import { Button, Switch, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useSwitchStatus } from "../services/user.hooks";
export const StatusSwitch = React.memo(({
  status,
  userUUID,
  onUnlock
}: {
  status: string;
  userUUID: string;
  onUnlock: (userUUID: string) => void;
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const switchStatusMutation = useSwitchStatus();
  
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const handleStatusChange = async (checked: boolean) => {
    const newStatus = checked ? 'active' : 'inactive';
    await switchStatusMutation.mutateAsync({ userUUID, newStatus });
    setCurrentStatus(newStatus);
  };

  const isLocked = currentStatus === 'locked';
  const isActive = currentStatus === 'active';

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        loading={switchStatusMutation.isPending}
        checkedChildren="Active"
        unCheckedChildren={isLocked ? 'Locked' : 'Inactive'}
        onChange={handleStatusChange}
        disabled={isLocked}
        size="small"
      />
   
      {isLocked && (
        <Tooltip title="Unlock user to change status">
          <Button
            size="small"
            type="text"
            icon={<UnlockOutlined />}
            onClick={() => onUnlock(userUUID)}
          />
        </Tooltip>
      )}
    </div>
  );
});

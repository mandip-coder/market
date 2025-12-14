import React, { useCallback, useEffect, useState } from "react";
import { User } from "./UserDataTable";
import { useLoading } from "@/hooks/useLoading";
import { toast } from "react-toastify";
import { Button, Switch, Tag, Tooltip } from "antd";
import { UnlockOutlined } from "@ant-design/icons";
import { useUsersStore } from "@/context/store/usersStore";
import { useApi } from "@/hooks/useAPI";
import { APIPATH } from "@/shared/constants/url";
export const StatusSwitch = React.memo(({
  status,
  userUUID,
  onUnlock
}: {
  status: string;
  userUUID: string;
  onUnlock: (userUUID: string) => void;
}) => {
  const API=useApi()
  const [currentStatus, setCurrentStatus] = useState(status);
  const { setTableDataState } = useUsersStore();
  const [loading, setLoading] = useLoading();
  const handleUserStatusUpdate = useCallback((userUUID: string, newStatus: User['status'], lockUntil?: string) => {
    setTableDataState(prevData =>
      prevData.map(user =>
        user.userUUID === userUUID ? { ...user, status: newStatus, lockUntil } : user
      )
    );
  }, []);
  
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const handleStatusChange = async (checked: boolean) => {
    setLoading(true);
    try {
      // Simulate API call
      const newStatus = checked ? 'active' : 'inactive';
      await API.patch(APIPATH.USERS.STATUSUPDATE(userUUID, newStatus));
      setCurrentStatus(newStatus);
      handleUserStatusUpdate(userUUID, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = currentStatus === 'locked';
  const isActive = currentStatus === 'active';

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        loading={loading}
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

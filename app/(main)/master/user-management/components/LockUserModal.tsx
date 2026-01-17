import ModalWrapper from "@/components/Modal/Modal";
import { useUsersStore } from "@/context/store/usersStore";
import { useLoading } from "@/hooks/useLoading";
import { DatePicker, Radio, Space } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { User } from "../services/user.types";


export const LockUserModal = React.memo(({
  onCancel,
  lockedUser,
  isEditing = false,
  currentLockUntil
}: {
  onCancel: () => void;
  lockedUser: User | null;
  isEditing?: boolean;
  currentLockUntil?: string;
}) => {
  
  const { lockModal,setLockModal } = useUsersStore();
  const [permanent, setPermanent] = useState(!currentLockUntil);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(currentLockUntil ? dayjs() : null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(currentLockUntil ? dayjs(currentLockUntil) : null);
  const { RangePicker } = DatePicker;
  const handleLockUser = useCallback((permanent: boolean, lockUntil?: string) => {
    if (!lockedUser) return;

    // Simulate API call
    setTimeout(() => {

      const action = isEditing ? 'updated' : 'locked';
      const lockType = permanent ? 'permanently' : `until ${dayjs(lockUntil).format('MMM DD, YYYY')}`;
      toast.success(`User ${lockedUser.loginUsername} ${action} ${lockType}`);

      setLockModal(false);
    }, 500);
  }, [lockedUser, isEditing]);

  // Initialize state when editing
  React.useEffect(() => {
    if (isEditing && currentLockUntil) {
      setPermanent(false);
      setStartDate(dayjs());
      setEndDate(dayjs(currentLockUntil));
    } else if (isEditing && !currentLockUntil) {
      setPermanent(true);
      setStartDate(null);
      setEndDate(null);
    }
  }, [isEditing, currentLockUntil, lockModal]);

  const handleConfirm = () => {
    if (!permanent && (!startDate || !endDate)) {
      toast.error("Please select a valid date range for temporary lock");
      return;
    }

    const lockUntil = permanent ? undefined : endDate?.toISOString();
    handleLockUser(permanent, lockUntil);
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    // Can't select days before today
    return current && current < dayjs().startOf('day');
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <ModalWrapper
      title={`${isEditing ? 'Edit' : 'Lock'} User: ${lockedUser?.fullName}`}
      open={lockModal}
      onCancel={onCancel}
      onOk={handleConfirm}
      okText={isEditing ? 'Update Lock' : 'Lock User'}
      cancelText="Cancel"
      width={500}
    >
      <div className="py-4">
        <Radio.Group
          value={permanent}
          onChange={(e) => setPermanent(e.target.value)}
          className="w-full"
        >
          <Space orientation="vertical" className="w-full">
            <Radio value={false}>
              Temporary Lock
            </Radio>
            <div className="ml-6 mb-4">
              <RangePicker
                disabled={permanent}
                value={[startDate, endDate]}
                onChange={handleDateRangeChange}
                disabledDate={disabledDate}
                placeholder={['Start Date', 'End Date']}
              />
            </div>
            <Radio value={true}>
              Permanent Lock
            </Radio>
          </Space>
        </Radio.Group>
      </div>
    </ModalWrapper>
  );
});
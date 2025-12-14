'use client'
import PageHeading from '@/components/PageHeading/PageHeading'
import { useUsersStore } from '@/context/store/usersStore'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import { memo, useMemo } from 'react'
import AddUserDrawer from './Add-User-Drawer'

function UserHeader() {
  const { addUserDrawer, toggleAddUserDrawer, editUser,setEditUser } = useUsersStore()
  const extraContent = useMemo(() => (
    <div className="flex gap-3 flex-shrink-0">
      <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={toggleAddUserDrawer}>
        Add New User
      </Button>
    </div>
  ), [])
  return (
    <>
      <PageHeading
        title="User Management"
        descriptionLine="Manage users and permissions"
        extra={extraContent}
      />
      <AddUserDrawer  />
    </>
  )
}

export default memo(UserHeader)

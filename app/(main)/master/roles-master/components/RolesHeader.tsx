'use client'
import PageHeading from '@/components/PageHeading/PageHeading'
import { useRoleStore } from '@/context/store/rolesStore'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import { memo, useMemo } from 'react'
import AddRoleDrawer from './AddRoleDrawer'

function RolesHeader() {
  const { toggleRolesDrawer } = useRoleStore()
  const extraContent = useMemo(() => (
    <div className="flex gap-3 flex-shrink-0">
      <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={toggleRolesDrawer}>
        Add New Role
      </Button>
    </div>
  ), [])

  return (
    <>
      <PageHeading
        title="Roles Management"
        descriptionLine="Manage Roles and user access"
        extra={extraContent}
      />
      <AddRoleDrawer />
    </>
  )
}

export default memo(RolesHeader)

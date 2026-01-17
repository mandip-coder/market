'use client'
import PageHeading from '@/components/PageHeading/PageHeading'
import { useCompanyStore } from '@/context/store/companyStore'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import { memo, useMemo } from 'react'
import AddCompanyDrawer from './AddCompanyDrawer'
function CompanyHeader() {
  const { toggleCompanyDrawer } = useCompanyStore()
  const extraContent = useMemo(() => (
    <div className="flex gap-3 flex-shrink-0">
      <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={toggleCompanyDrawer}>
        Add New Company
      </Button>
    </div>
  ), [])

  return (
    <>
      <PageHeading
        title="Company Management"
        descriptionLine="Manage companies and user access"
        extra={extraContent}
      />
      <AddCompanyDrawer  />
    </>
  )
}

export default memo(CompanyHeader)

'use client'
import React, { memo, useMemo, useCallback, useState } from 'react'
import PageHeading from '@/components/PageHeading/PageHeading'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import AddCompanyDrawer from './AddCompanyDrawer'
import { useCompanyStore } from '@/context/store/companyStore'

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
      <AddCompanyDrawer />
    </>
  )
}

export default memo(CompanyHeader)

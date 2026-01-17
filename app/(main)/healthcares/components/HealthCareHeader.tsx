'use client'
import PageHeading from '@/components/PageHeading/PageHeading'
import { useHealthCareStore } from '@/context/store/healthCareStore'
import { Button } from 'antd'
import { Plus } from 'lucide-react'
import React, { memo } from 'react'
import AddhealthcareDrawer from '../AddHealthCare'

function HealthCareHeader() {
  const { viewMode, toggleViewMode, setHealthCareModal,addHealthCareModal } = useHealthCareStore  ()

  return (<>
    <PageHeading
      title="Healthcares"
      descriptionLine='List of all healthcares'
      extra={
        <div className="flex gap-3 flex-shrink-0">
          <Button onClick={toggleViewMode}>
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
  
          <Button type="primary" onClick={() => setHealthCareModal(true)} icon={<Plus className="h-4 w-4" />}>
            New Healthcare
          </Button>
        </div>
      } />
      <AddhealthcareDrawer/>
      </>
  )
}
export default memo(HealthCareHeader)


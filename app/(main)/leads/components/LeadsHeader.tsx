'use client'
import PageHeading from '@/components/PageHeading/PageHeading';
import { useLeadStore } from '@/context/store/leadsStore';
import { Button } from 'antd';
import { Search } from 'lucide-react';
import { memo, useMemo } from 'react';
import LeadDrawer from './LeadDrawer';

function LeadsHeader() {
  const toggleLeadDrawer = useLeadStore((state) => state.toggleLeadDrawer);

  const extraContent = useMemo(() => (
    <div className="flex gap-3 flex-shrink-0">
      <Button type="primary" icon={<Search size={16} />} onClick={() => toggleLeadDrawer()}>
        New Prospect
      </Button>
    </div>
  ), [])

  return (<>
    <PageHeading
      title="Prospect"
      descriptionLine="Prospects and Recommendations"
      extra={extraContent}
    />
    <LeadDrawer />

  </>
  )
}
export default memo(LeadsHeader)

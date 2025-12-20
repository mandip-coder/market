
'use client'
import { Skeleton } from 'antd'

export default function StageSkeleton() {
  return (
    <div className='flex gap-6'>
      <Skeleton.Input active size="small" className='!w-full' />
      <Skeleton.Avatar active size="small" />
    </div>
  )
}

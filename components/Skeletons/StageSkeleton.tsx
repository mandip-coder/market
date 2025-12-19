
'use client'
import { Skeleton } from 'antd'

export default function StageSkeleton() {
  return (
    <div className='flex gap-6'>
    <Skeleton.Button active size="small" className='!w-full' />
    <Skeleton.Avatar active size="small"  />
    </div>
  )
}

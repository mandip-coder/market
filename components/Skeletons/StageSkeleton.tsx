
'use client'
import { Skeleton } from 'antd'
import React from 'react'

export default function StageSkeleton() {
  return (
    <div className='flex gap-6'>
    <Skeleton.Button active size="small" className='!w-full' />
    <Skeleton.Avatar active size="small"  />
    </div>
  )
}

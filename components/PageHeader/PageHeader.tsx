import { Affix, Card } from 'antd'
import React from 'react'

type Props = {
  title: React.ReactNode
  extra?: React.ReactNode
  children?: React.ReactNode
  descriptionLine?: string
}

export default function PageHeader({ title, children, extra, descriptionLine }: Props) {
  return (
    <Card variant='borderless' size='small' className='!rounded-none'>
      <div className='px-2'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <div className='flex gap-1'>
            <div>
              <h1 className='text-lg font-semibold text-primary'>{title}</h1>
              {descriptionLine && <span className='text-gray-400 text-xs'>{descriptionLine}</span>}
            </div>
          </div>
          {extra && extra}
        </div>
        {children && <div className='mt-3'>
          {children}
        </div>}
      </div>
    </Card>
  )
}
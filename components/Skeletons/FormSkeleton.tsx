'use client'
import { Card, Skeleton } from 'antd'

export default function FormSkeleton() {
  return (
    <Card className="w-full" variant='borderless' size='small'>
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-6 pb-4  dark:border-gray-700">
        <Skeleton.Avatar active size="default" shape="circle" />
        <Skeleton.Input active size="small" style={{ width: 180 }} />
      </div>

      {/* Card Body - Form with 3 inputs per row, 3 rows */}
      <div className="space-y-6 mb-6">
        {/* Row 1 - three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={`row1-${index}`} className="space-y-2">
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '60%', height: 12 }} 
              />
              <Skeleton.Input 
                active 
                block 
                style={{ height: 20 }} 
              />
            </div>
          ))}
        </div>

        {/* Row 2 - three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={`row2-${index}`} className="space-y-2">
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '70%', height: 12 }} 
              />
              <Skeleton.Input 
                active 
                block 
                style={{ height: 20 }} 
              />
            </div>
          ))}
        </div>

        {/* Row 3 - three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={`row3-${index}`} className="space-y-2">
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '50%', height: 12 }} 
              />
              <Skeleton.Input 
                active 
                block 
                style={{ height: 20 }} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer - Save and Update buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton.Button active style={{ width: 70, height: 20 }} />
      </div>
    </Card>
  )
}
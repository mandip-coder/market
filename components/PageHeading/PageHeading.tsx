import React, { memo } from 'react'

interface PageHeadingProps {
  extra?: React.ReactNode
  title?: string
  descriptionLine?: string
}
function PageHeading({ extra, descriptionLine, title }: PageHeadingProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
          {descriptionLine}
        </p>
      </div>
      {extra && extra}
    </div>
  )
}
export default memo(PageHeading)
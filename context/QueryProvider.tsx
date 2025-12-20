'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { getQueryClient } from './get-query-client'


export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const client = getQueryClient()
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

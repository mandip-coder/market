import React from 'react';
import AppLayout from '@/components/Layout/Layout'
import NProgressHandler from '@/components/NProgress/NprogressHandler';
import { App } from 'antd';
export default function Layout({ children }: { children: React.ReactNode }) {

  return <AppLayout>
      <NProgressHandler />
      {children}
  </AppLayout>;
}

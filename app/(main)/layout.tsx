import AppLayout from '@/components/Layout/Layout';
import NProgressHandler from '@/components/NProgress/NprogressHandler';
import React from 'react';



export default function Layout({ children }: { children: React.ReactNode }) {

  return <AppLayout>
    <NProgressHandler />
    {children}
  </AppLayout>;
}

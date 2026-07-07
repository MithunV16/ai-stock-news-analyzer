'use client';

import type { ReactNode } from 'react';
import { DashboardNavProvider } from '@/context/DashboardNavContext';
import { DetailDrawerShell } from '@/components/layout/DetailDrawerShell';
import { DashboardHeader } from '@/components/layout/header/DashboardHeader';
import { Sidebar } from '@/components/layout/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

export function DashboardLayout({
  children,
  drawer,
  drawerOpen = false,
  onDrawerClose,
}: DashboardLayoutProps) {
  return (
    <DashboardNavProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-canvas text-zinc-100">
        <DashboardHeader />

        <div className="flex min-h-0 flex-1">
          <Sidebar />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <main className="min-h-0 flex-1 overflow-hidden p-2 md:p-3">{children}</main>
            <DetailDrawerShell open={drawerOpen} onClose={onDrawerClose}>
              {drawer}
            </DetailDrawerShell>
          </div>
        </div>
      </div>
    </DashboardNavProvider>
  );
}

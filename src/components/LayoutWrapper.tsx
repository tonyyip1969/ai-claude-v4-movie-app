'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Hide sidebar on movie detail pages
  const hideSidebar = pathname?.startsWith('/movie/');

  return (
    <div className="min-h-screen">
      {!hideSidebar && <Sidebar />}
      <main className={hideSidebar ? '' : 'lg:ml-72'}>
        <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

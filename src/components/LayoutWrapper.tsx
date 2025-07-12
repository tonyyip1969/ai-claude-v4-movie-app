'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useSidebar } from '@/contexts/SidebarContext';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  
  // Hide sidebar on movie detail pages
  const hideSidebar = pathname?.startsWith('/movie/');

  return (
    <div className="min-h-screen">
      {!hideSidebar && <Sidebar />}
      <main className={cn(
        "transition-all duration-300",
        hideSidebar ? '' : isCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      )}>
        <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

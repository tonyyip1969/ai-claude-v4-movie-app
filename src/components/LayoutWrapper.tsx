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
        <div className={cn(
          "container mx-auto py-8 lg:py-12 max-w-7xl transition-all duration-300",
          hideSidebar 
            ? "px-2 lg:px-2" 
            : isCollapsed 
              ? "px-2 lg:px-2" // Reduced padding when sidebar is collapsed
              : "px-2 lg:px-2"  // Normal padding when sidebar is expanded
        )}>
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

'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <main className={cn(
      "flex-1 transition-all duration-300",
      "lg:ml-80", // Default margin for expanded sidebar
      isCollapsed && "lg:ml-20" // Reduced margin for collapsed sidebar
    )}>
      <div className="container mx-auto px-2 py-8 lg:px-2 lg:py-12 max-w-7xl">
        {children}
      </div>
    </main>
  );
}

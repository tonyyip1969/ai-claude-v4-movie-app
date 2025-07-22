'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Shuffle, Menu, X, Film, Clock, Settings, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { useMovieCounts } from '@/hooks/use-movie-counts';
import { getAppVersion } from '@/lib/version';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Favourites', href: '/favorites', icon: Heart },
  { name: 'Watch List', href: '/watchlist', icon: Clock },
  { name: 'Random', href: '/random', icon: Shuffle },
  { name: 'Import', href: '/import', icon: Upload },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, isMobileOpen, setIsMobileOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  
  // Use optimized movie counts hook
  const { data: counts, isLoading: isCountsLoading } = useMovieCounts();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  // Handle mobile responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileOpen]);

  // Default counts fallback
  const movieCounts = counts ?? { total: 0, favorites: 0, watchlist: 0 };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed && !isMobileOpen ? "justify-center" : "space-x-3"
        )}>
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
            <Film className="w-6 h-6 text-white" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div>
              <h1 className="text-xl font-bold text-white">Movie App</h1>
              <p className="text-sm text-gray-400">Discover amazing films</p>
            </div>
          )}
        </div>
        
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          // Get count for this navigation item
          let count = 0;
          if (item.href === '/favorites') {
            count = movieCounts.favorites;
          } else if (item.href === '/watchlist') {
            count = movieCounts.watchlist;
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive 
                  ? "bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                isCollapsed && !isMobileOpen ? "justify-center" : "justify-between"
              )}
            >
              <div className={cn(
                "flex items-center",
                isCollapsed && !isMobileOpen ? "justify-center" : "space-x-3"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isActive ? "text-primary-400" : "group-hover:text-primary-400"
                )} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="font-medium">{item.name}</span>
                )}
              </div>
              
              {/* Count badge and active indicator */}
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center space-x-2">
                  {/* Count badge */}
                  {count > 0 && (
                    <span className={cn(
                      "px-2 py-1 text-xs font-semibold rounded-full transition-colors",
                      isActive 
                        ? "bg-primary-500/30 text-primary-300" 
                        : "bg-gray-700 text-gray-300 group-hover:bg-gray-600"
                    )}>
                      {count}
                    </span>
                  )}
                  {/* Loading indicator for counts */}
                  {isCountsLoading && (count > 0 || (!counts && (item.href === '/favorites' || item.href === '/watchlist'))) && (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-primary-400 rounded-full animate-spin" />
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 pb-4">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive 
                  ? "bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                isCollapsed && !isMobileOpen ? "justify-center" : "justify-start"
              )}
            >
              <div className={cn(
                "flex items-center",
                isCollapsed && !isMobileOpen ? "justify-center" : "space-x-3"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isActive ? "text-primary-400" : "group-hover:text-primary-400"
                )} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="font-medium">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        {(!isCollapsed || isMobileOpen) && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Movie App v{getAppVersion()}</p>
            <p className="text-xs text-gray-600">
              Built with Next.js & TailwindCSS
            </p>
          </div>
        )}
        
        {/* Collapse toggle button (desktop only) */}
        <div className="hidden lg:block mt-4">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 transition-all duration-300 z-50",
          // Desktop behavior
          "hidden lg:block",
          isCollapsed ? "lg:w-20" : "lg:w-72",
          // Mobile behavior
          "lg:translate-x-0",
          isMobileOpen ? "block w-80 translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}

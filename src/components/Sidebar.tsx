'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Shuffle, Menu, X, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Favourites', href: '/favorites', icon: Heart },
  { name: 'Random', href: '/random', icon: Shuffle },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle mobile responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

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
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive 
                  ? "bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                isCollapsed && !isMobileOpen ? "justify-center" : "space-x-3"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors duration-300",
                isActive ? "text-primary-400" : "group-hover:text-primary-400"
              )} />
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-medium">{item.name}</span>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        {(!isCollapsed || isMobileOpen) && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Movie App v1.0</p>
            <p className="text-xs text-gray-600">
              Built with Next.js & TailwindCSS
            </p>
          </div>
        )}
        
        {/* Collapse toggle button (desktop only) */}
        <div className="hidden lg:block mt-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
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
          isCollapsed ? "lg:w-20" : "lg:w-80",
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

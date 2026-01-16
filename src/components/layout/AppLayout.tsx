import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header with trigger - visible on all screens */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
            <SidebarTrigger className="text-foreground hover:bg-accent rounded-md p-2 transition-colors">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            {title && (
              <h1 className="font-display text-lg text-foreground truncate">
                {title}
              </h1>
            )}
          </header>
          
          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

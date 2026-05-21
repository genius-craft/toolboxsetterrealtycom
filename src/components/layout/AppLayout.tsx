import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ToolAssistantButton } from '@/components/tool-assistant/ToolAssistantButton';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
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
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4">
            <SidebarTrigger className="text-foreground hover:bg-secondary rounded-md p-2 transition-colors">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            {title && (
              <h1 className="font-display text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
            )}
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </SidebarInset>

        <WhatsAppButton />
        <ToolAssistantButton />
      </div>
    </SidebarProvider>
  );
}

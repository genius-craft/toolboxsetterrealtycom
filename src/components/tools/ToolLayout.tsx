import React from 'react';
import { ToolNavbar } from './ToolNavbar';

interface ToolLayoutProps {
  title: string;
  children: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function ToolLayout({ title, children, rightPanel }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <ToolNavbar title={title} />
      
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Inputs (Scrollable) */}
        <div className="flex-1 lg:max-w-xl xl:max-w-2xl overflow-y-auto p-6 lg:p-8 lg:h-[calc(100vh-64px)]">
          <div className="space-y-6">
            {children}
          </div>
        </div>
        
        {/* Right Panel - Dashboard (Sticky) */}
        <div className="flex-1 bg-secondary/30 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-6 lg:p-8">
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}

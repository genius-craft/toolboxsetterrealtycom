import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ToolLayoutProps {
  title?: string;
  children: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function ToolLayout({ title, children, rightPanel }: ToolLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-background">
      {/* Mobile Title */}
      {title && (
        <div className="lg:hidden px-4 pt-4 pb-2">
          <h1 className="font-serif text-xl text-foreground">{title}</h1>
        </div>
      )}
      
      {/* Desktop Title - only shown on larger screens where sidebar is visible */}
      {title && (
        <div className="hidden lg:block px-6 lg:px-8 pt-6">
          <h1 className="font-serif text-2xl text-foreground">{title}</h1>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Inputs (Scrollable) */}
        <div className="flex-1 lg:max-w-xl xl:max-w-2xl overflow-y-auto p-4 sm:p-6 lg:p-8 lg:h-[calc(100vh-64px)]">
          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
        
        {/* Mobile Results Indicator */}
        <div className="lg:hidden flex items-center justify-center py-3 bg-secondary/50 border-y border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <ChevronDown className="h-4 w-4" />
            <span>Resultados abaixo</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        
        {/* Right Panel - Dashboard (Sticky) */}
        <div className="flex-1 bg-secondary/30 lg:sticky lg:top-0 lg:h-screen overflow-y-auto pb-safe">
          <div className="p-4 sm:p-6 lg:p-8">
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
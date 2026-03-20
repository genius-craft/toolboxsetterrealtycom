import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ToolLayoutProps {
  title?: string;
  children: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function ToolLayout({ title, children, rightPanel }: ToolLayoutProps) {
  const scrollToResults = () => {
    const el = document.getElementById('tool-results');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-background">
      {/* Mobile Title */}
      {title && (
        <div className="lg:hidden px-4 pt-4 pb-2 animate-fade-in">
          <h1 className="font-serif text-xl text-foreground">{title}</h1>
        </div>
      )}
      
      {/* Desktop Title */}
      {title && (
        <div className="hidden lg:block px-6 lg:px-8 pt-6 animate-fade-in">
          <h1 className="font-serif text-2xl text-foreground">{title}</h1>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Inputs (Scrollable) */}
        <div className="flex-1 lg:max-w-xl xl:max-w-2xl overflow-y-auto p-4 sm:p-6 lg:p-8 lg:h-[calc(100vh-64px)] animate-fade-up">
          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
        
        {/* Mobile Results Button */}
        <div className="lg:hidden flex items-center justify-center py-3 bg-secondary/50 border-y border-border">
          <button
            onClick={scrollToResults}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97] px-4 py-1.5 rounded-full hover:bg-secondary"
          >
            <ChevronDown className="h-4 w-4" />
            <span>Ver Resultados</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        {/* Right Panel - Dashboard (Sticky) */}
        <div id="tool-results" className="flex-1 bg-secondary/30 lg:sticky lg:top-0 lg:h-screen overflow-y-auto pb-safe">
          <div className="p-4 sm:p-6 lg:p-8 animate-fade-up delay-200">
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleInputCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleInputCard({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  className,
}: CollapsibleInputCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden transition-shadow duration-300 hover:shadow-card-hover">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 sm:p-4 lg:p-5 hover:bg-secondary/50 transition-colors touch-target active:scale-[0.995]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-foreground">
                {title}
              </h3>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5 pt-0 space-y-3 sm:space-y-4">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

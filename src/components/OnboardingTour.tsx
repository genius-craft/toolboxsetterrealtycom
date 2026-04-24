import { useEffect, useState, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  selector?: string; // CSS selector to highlight; if absent, centered modal
  title: string;
  description: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  storageKey?: string;
  open: boolean;
  onClose: () => void;
}

const PADDING = 8;

export function OnboardingTour({ steps, storageKey, open, onClose }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[stepIndex];

  useLayoutEffect(() => {
    if (!open || !step?.selector) {
      setRect(null);
      return;
    }
    const update = () => {
      const el = document.querySelector(step.selector!) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // wait for scroll
        setTimeout(() => setRect(el.getBoundingClientRect()), 250);
      } else {
        setRect(null);
      }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step, open, stepIndex]);

  const finish = () => {
    if (storageKey) localStorage.setItem(storageKey, 'true');
    setStepIndex(0);
    onClose();
  };

  if (!open || !step) return null;

  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  // Compute tooltip position
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10001,
  };

  if (rect) {
    const tooltipWidth = 340;
    const tooltipHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.right;

    if (spaceBelow > tooltipHeight + 20) {
      tooltipStyle = {
        position: 'fixed',
        top: rect.bottom + PADDING + 12,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - tooltipWidth - 16)),
        zIndex: 10001,
      };
    } else if (spaceRight > tooltipWidth + 20) {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, rect.top),
        left: rect.right + PADDING + 12,
        zIndex: 10001,
      };
    } else {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, rect.top - tooltipHeight - PADDING - 12),
        left: Math.max(16, Math.min(rect.left, window.innerWidth - tooltipWidth - 16)),
        zIndex: 10001,
      };
    }
  }

  // Spotlight via 4-rect overlay (instead of clip-path for browser compat)
  const overlays = rect
    ? [
        // top
        { top: 0, left: 0, width: '100%', height: Math.max(0, rect.top - PADDING) },
        // bottom
        {
          top: rect.bottom + PADDING,
          left: 0,
          width: '100%',
          height: Math.max(0, window.innerHeight - (rect.bottom + PADDING)),
        },
        // left
        {
          top: Math.max(0, rect.top - PADDING),
          left: 0,
          width: Math.max(0, rect.left - PADDING),
          height: rect.height + PADDING * 2,
        },
        // right
        {
          top: Math.max(0, rect.top - PADDING),
          left: rect.right + PADDING,
          width: Math.max(0, window.innerWidth - (rect.right + PADDING)),
          height: rect.height + PADDING * 2,
        },
      ]
    : null;

  return (
    <>
      {overlays ? (
        <>
          {overlays.map((o, i) => (
            <div
              key={i}
              className="fixed bg-black/65 transition-all duration-300 pointer-events-auto"
              style={{ ...o, zIndex: 10000 }}
              onClick={() => {}}
            />
          ))}
          {/* Highlight border */}
          <div
            className="fixed pointer-events-none rounded-lg border-2 border-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.3)] transition-all duration-300"
            style={{
              top: rect!.top - PADDING,
              left: rect!.left - PADDING,
              width: rect!.width + PADDING * 2,
              height: rect!.height + PADDING * 2,
              zIndex: 10000,
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-black/65 z-[10000]" />
      )}

      <div
        style={tooltipStyle}
        className="bg-card border border-border rounded-xl shadow-2xl p-5 w-[340px] max-w-[calc(100vw-32px)] animate-scale-in"
      >
        <button
          onClick={finish}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar tour"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-xs uppercase tracking-wider text-accent font-medium mb-2">
          Passo {stepIndex + 1} de {steps.length}
        </div>
        <h3 className="font-serif text-lg font-medium mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground">
            Pular
          </Button>
          <div className="flex gap-2">
            {!isFirst && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStepIndex((i) => i - 1)}
              >
                <ArrowLeft className="h-3 w-3 mr-1" /> Voltar
              </Button>
            )}
            <Button
              variant="gold"
              size="sm"
              onClick={() => (isLast ? finish() : setStepIndex((i) => i + 1))}
            >
              {isLast ? 'Concluir' : (
                <>Próximo <ArrowRight className="h-3 w-3 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1 mt-3 justify-center">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === stepIndex ? 'w-6 bg-accent' : 'w-1.5 bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, GripVertical } from "lucide-react";
import { ToolAssistantPanel } from "./ToolAssistantPanel";

const HIDDEN_ROUTES = ["/auth", "/pending-approval"];
const STORAGE_KEY = "tool-assistant-position";
const BUTTON_SIZE = { w: 140, h: 56 }; // approximate for clamping
const MARGIN = 8;

type Position = { x: number; y: number };

function getDefaultPosition(): Position {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: window.innerWidth - BUTTON_SIZE.w - 24,
    y: window.innerHeight - BUTTON_SIZE.h - 24,
  };
}

function loadPosition(): Position {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Position;
      if (typeof p.x === "number" && typeof p.y === "number") return p;
    }
  } catch {}
  return getDefaultPosition();
}

function clamp(p: Position): Position {
  if (typeof window === "undefined") return p;
  const maxX = window.innerWidth - BUTTON_SIZE.w - MARGIN;
  const maxY = window.innerHeight - BUTTON_SIZE.h - MARGIN;
  return {
    x: Math.max(MARGIN, Math.min(p.x, maxX)),
    y: Math.max(MARGIN, Math.min(p.y, maxY)),
  };
}

export function ToolAssistantButton() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>(getDefaultPosition);
  const [dragging, setDragging] = useState(false);
  const dragInfo = useRef<{ offsetX: number; offsetY: number; moved: boolean } | null>(null);
  const location = useLocation();

  // Load saved position on mount
  useEffect(() => {
    setPosition(clamp(loadPosition()));
  }, []);

  // Listen to global "open TOOL" events (from sidebar link)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("tool-assistant:open", handler);
    return () => window.removeEventListener("tool-assistant:open", handler);
  }, []);

  // Re-clamp on viewport resize
  useEffect(() => {
    const onResize = () => setPosition((p) => clamp(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragInfo.current = {
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
      moved: false,
    };
    setDragging(true);
  }, [position.x, position.y]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current) return;
    const next = clamp({
      x: e.clientX - dragInfo.current.offsetX,
      y: e.clientY - dragInfo.current.offsetY,
    });
    if (
      Math.abs(next.x - position.x) > 2 ||
      Math.abs(next.y - position.y) > 2
    ) {
      dragInfo.current.moved = true;
    }
    setPosition(next);
  }, [position.x, position.y]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    const moved = dragInfo.current.moved;
    dragInfo.current = null;
    setDragging(false);
    setPosition((p) => {
      const c = clamp(p);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
      } catch {}
      return c;
    });
    // If user didn't drag, treat as click → open panel
    if (!moved) setOpen(true);
  }, []);

  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Abrir TOOL — assistente do Setter Toolbox (arraste para mover)"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        style={{
          left: position.x,
          top: position.y,
          touchAction: "none",
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        className="fixed z-40 group select-none"
      >
        <div
          className={`relative flex items-center gap-2 bg-gradient-to-br from-accent to-accent/70 text-accent-foreground pl-2 pr-4 py-3 rounded-full shadow-lg transition-shadow duration-200 ${
            dragging ? "shadow-2xl scale-105" : "hover:shadow-xl"
          }`}
        >
          <GripVertical className="h-3.5 w-3.5 opacity-60" aria-hidden />
          <div className="relative">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-background animate-pulse" />
          </div>
          <span className="hidden sm:inline whitespace-nowrap font-semibold tracking-wide text-sm">
            TOOL
          </span>
        </div>
      </div>

      <ToolAssistantPanel open={open} onOpenChange={setOpen} />
    </>
  );
}

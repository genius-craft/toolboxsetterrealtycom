import { useState, useEffect, useCallback } from 'react';
import { Bell, UserPlus, FolderPlus, Store, Shield, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type NotificationType = 'new_signup' | 'new_project' | 'vitrine_published' | 'lgpd_request';

interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  entity_id: string | null;
  read: boolean;
  created_at: string;
}

const typeIcon: Record<NotificationType, typeof Bell> = {
  new_signup: UserPlus,
  new_project: FolderPlus,
  vitrine_published: Store,
  lgpd_request: Shield,
};

const typeColor: Record<NotificationType, string> = {
  new_signup: 'text-blue-500',
  new_project: 'text-emerald-500',
  vitrine_published: 'text-accent',
  lgpd_request: 'text-rose-500',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function NotificationBell() {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = items.filter((i) => !i.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!isSuperAdmin) return;
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setItems(data as AdminNotification[]);
  }, [isSuperAdmin]);

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    fetchNotifications();

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          const next = payload.new as AdminNotification;
          setItems((prev) => [next, ...prev].slice(0, 30));
          toast(next.title, { description: next.message ?? undefined });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin, roleLoading, fetchNotifications]);

  const markAllRead = async () => {
    const ids = items.filter((i) => !i.read).map((i) => i.id);
    if (ids.length === 0) return;
    await supabase
      .from('admin_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', ids);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  const markOneRead = async (id: string) => {
    await supabase
      .from('admin_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  };

  if (roleLoading || !isSuperAdmin) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-foreground hover:bg-accent/10"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 bg-card border-border"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b border-border p-3">
          <div>
            <h3 className="font-display text-sm font-semibold">Notificações</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo em dia'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7">
              <Check className="h-3.5 w-3.5 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </div>
          ) : (
            items.map((n) => {
              const Icon = typeIcon[n.type] || Bell;
              const colorClass = typeColor[n.type] || 'text-muted-foreground';
              const content = (
                <div
                  className={cn(
                    'flex items-start gap-3 p-3 border-b border-border/50 transition-colors hover:bg-secondary/50',
                    !n.read && 'bg-accent/5'
                  )}
                >
                  <div className={cn('mt-0.5 p-1.5 rounded-md bg-secondary', colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                  )}
                </div>
              );
              return n.link ? (
                <Link
                  key={n.id}
                  to={n.link}
                  onClick={() => {
                    markOneRead(n.id);
                    setOpen(false);
                  }}
                  className="block"
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className="block w-full text-left"
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  ArrowLeftRight, 
  BarChart3, 
  CheckCircle,
  Target,
  LogOut,
  User,
  Users,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Store,
  ExternalLink,
  BookOpen,
  Sparkles,
  Settings,
  Shield,
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Simulador', url: '/simulador', icon: Calculator },
  { title: 'Permuta', url: '/permuta', icon: ArrowLeftRight },
  { title: 'H&BU', url: '/highest-best-use', icon: BarChart3 },
  { title: 'Decisor', url: '/decisor', icon: CheckCircle },
  { title: 'Preço Teto', url: '/preco-teto', icon: Target },
  { title: 'Vitrine', url: '/vitrine', icon: Store },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { isAdmin, isSuperAdmin } = useUserRole();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm">
              S
            </div>
            {!isCollapsed && (
              <span className="font-display text-lg text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">
                Setter<span className="text-accent">Toolbox</span>
              </span>
            )}
          </Link>
          {!isCollapsed ? (
            <SidebarTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <ChevronLeft className="h-4 w-4" />
            </SidebarTrigger>
          ) : (
            <SidebarTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent mx-auto mt-2">
              <ChevronRight className="h-4 w-4" />
            </SidebarTrigger>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider px-2 mb-2">
            {!isCollapsed && 'Ferramentas'}
          </SidebarGroupLabel>
          <SidebarGroupContent data-tour="sidebar">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={cn(
                      'transition-all duration-200 relative',
                      isActive(item.url) 
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium' 
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      {isActive(item.url) && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
                      )}
                      <item.icon className={cn('h-4 w-4 shrink-0', isActive(item.url) && 'text-accent')} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Fale com o TOOL"
                  onClick={() => window.dispatchEvent(new CustomEvent('tool-assistant:open'))}
                  className={cn(
                    'transition-all duration-200 relative cursor-pointer',
                    'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                    <span>Fale com o TOOL</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider px-2 mb-2">
              {!isCollapsed && 'Administração'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/users')}
                    tooltip="Gestão de Usuários"
                    className={cn(
                      'transition-all duration-200 relative',
                      isActive('/admin/users') 
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium' 
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Link to="/admin/users" className="flex items-center gap-3">
                      {isActive('/admin/users') && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
                      )}
                      <Users className={cn('h-4 w-4 shrink-0', isActive('/admin/users') && 'text-accent')} />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/projects')}
                    tooltip="Projetos dos Usuários"
                    className={cn(
                      'transition-all duration-200 relative',
                      isActive('/admin/projects') 
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium' 
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Link to="/admin/projects" className="flex items-center gap-3">
                      {isActive('/admin/projects') && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
                      )}
                      <FolderKanban className={cn('h-4 w-4 shrink-0', isActive('/admin/projects') && 'text-accent')} />
                      <span>Projetos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/tool-knowledge')}
                    tooltip="Conhecimento da TOOL"
                    className={cn(
                      'transition-all duration-200 relative',
                      isActive('/admin/tool-knowledge')
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Link to="/admin/tool-knowledge" className="flex items-center gap-3">
                      {isActive('/admin/tool-knowledge') && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
                      )}
                      <BookOpen className={cn('h-4 w-4 shrink-0', isActive('/admin/tool-knowledge') && 'text-accent')} />
                      <span>TOOL Knowledge</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 space-y-1">
        {/* Back to site link */}
        {!isCollapsed && (
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors rounded-md hover:bg-sidebar-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Voltar ao site
          </Link>
        )}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-10"
              >
                <User className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate text-sm">
                    {user.email?.split('@')[0]}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side={isCollapsed ? 'right' : 'top'} 
              align="start"
              className="w-56 bg-card border-border"
            >
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Meus Projetos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => signOut()} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-10"
            >
              <User className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="text-sm">Entrar</span>}
            </Button>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

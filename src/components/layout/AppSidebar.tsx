import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  ArrowLeftRight, 
  BarChart3, 
  CheckCircle,
  LogOut,
  User,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Simulador', url: '/simulador', icon: Calculator },
  { title: 'Permuta', url: '/permuta', icon: ArrowLeftRight },
  { title: 'H&BU', url: '/highest-best-use', icon: BarChart3 },
  { title: 'Decisor', url: '/decisor', icon: CheckCircle },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [isAdmin, setIsAdmin] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'super_admin']);
        
        setIsAdmin(data && data.length > 0);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, [user]);

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
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={`
                      transition-all duration-200
                      ${isActive(item.url) 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' 
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }
                    `}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                    className={`
                      transition-all duration-200
                      ${isActive('/admin/users') 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' 
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }
                    `}
                  >
                    <Link to="/admin/users" className="flex items-center gap-3">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'super_admin' | 'user' | 'hunter';

interface UseAdminRoleOptions {
  requiredRoles?: AppRole[];
  redirectTo?: string;
}

interface UseAdminRoleResult {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roles: AppRole[];
  isLoading: boolean;
  isAuthorized: boolean;
}

/**
 * Hook to verify admin roles server-side.
 * Redirects unauthorized users to the specified path.
 */
export function useAdminRole(options: UseAdminRoleOptions = {}): UseAdminRoleResult {
  const { 
    requiredRoles = ['admin', 'super_admin'],
    redirectTo = '/dashboard'
  } = options;
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function verifyRole() {
      if (authLoading) return;
      
      if (!user) {
        setIsLoading(false);
        setIsAuthorized(false);
        navigate(redirectTo);
        return;
      }

      try {
        // Query user roles from database (RLS ensures user can only see own roles)
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error verifying role:', error);
          throw error;
        }

        const userRoles = (data || []).map(r => r.role as AppRole);
        setRoles(userRoles);

        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para acessar esta página.',
            variant: 'destructive',
          });
          navigate(redirectTo);
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Role verification failed:', error);
        navigate(redirectTo);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    }

    verifyRole();
  }, [user, authLoading, requiredRoles, redirectTo, navigate, toast]);

  return {
    isAdmin: roles.includes('admin') || roles.includes('super_admin'),
    isSuperAdmin: roles.includes('super_admin'),
    roles,
    isLoading: authLoading || isLoading,
    isAuthorized,
  };
}

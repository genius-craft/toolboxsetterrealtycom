import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'user' | 'admin' | 'super_admin' | 'hunter';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [ecosystemMember, setEcosystemMember] = useState(false);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRoles([]);
      setEcosystemMember(false);
      setApproved(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', user.id),
      supabase.from('profiles').select('ecosystem_member, approved').eq('user_id', user.id).maybeSingle(),
    ]).then(([rolesRes, profileRes]) => {
      if (cancelled) return;
      setRoles((rolesRes.data || []).map((r: any) => r.role as AppRole));
      setEcosystemMember(!!(profileRes.data as any)?.ecosystem_member);
      setApproved(!!(profileRes.data as any)?.approved);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  return {
    roles,
    loading,
    isAdmin,
    isSuperAdmin: roles.includes('super_admin'),
    ecosystemMember,
    approved,
    // Ecosystem access is implicit for admins
    hasEcosystemAccess: isAdmin || ecosystemMember,
  };
}

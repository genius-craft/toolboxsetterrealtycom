import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateProfile, getValidationError, ALLOWED_CATEGORIES } from '@/lib/validation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string, phone?: string, category?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { error: error as Error | null };
    }
    
    // Verificar se usuário está aprovado
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved')
        .eq('user_id', data.user.id)
        .maybeSingle();
      
      if (!profile?.approved) {
        // Fazer logout e retornar erro
        await supabase.auth.signOut();
        return { 
          error: new Error('Sua conta ainda não foi aprovada. Aguarde a aprovação da Setter.') 
        };
      }
    }
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, name?: string, phone?: string, category?: string) => {
    // Validate profile data before proceeding
    const profileData = { name, phone, category };
    const validation = validateProfile(profileData);
    
    if (!validation.success) {
      return { error: new Error(getValidationError(validation)) };
    }

    // Validate category against allowed values
    if (category && !ALLOWED_CATEGORIES.includes(category as typeof ALLOWED_CATEGORIES[number])) {
      return { error: new Error('Categoria inválida') };
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: validation.data.name },
      },
    });

    // Create profile if signup successful
    if (!error && data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        name: validation.data.name,
        phone: validation.data.phone,
        category: validation.data.category,
      });
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

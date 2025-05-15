import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  lastActivity: number;
  sessionTimeout: number;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nomeCompleto: string, cpf: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  updateLastActivity: () => void;
  checkSessionTimeout: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      lastActivity: Date.now(),
      sessionTimeout: 30 * 60 * 1000, // 30 minutos
      
      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            set({
              user: data.user,
              profile,
              isAuthenticated: true,
              lastActivity: Date.now(),
            });
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro no login:', error);
          return false;
        }
      },
      
      register: async (email: string, password: string, nomeCompleto: string, cpf: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                nome_completo: nomeCompleto,
                cpf: cpf
              }
            }
          });
          
          if (error) throw error;
          
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  nome_completo: nomeCompleto,
                  cpf: cpf
                },
              ]);
            
            if (profileError) throw profileError;
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro no registro:', error);
          return false;
        }
      },
      
      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error('Erro no logout:', error);
        }
      },
      
      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          
          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Erro ao resetar senha:', error);
          return false;
        }
      },
      
      updateProfile: async (data: Partial<Profile>) => {
        try {
          const { user } = get();
          if (!user) return false;
          
          const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id);
          
          if (error) throw error;
          
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...data } : null,
          }));
          
          return true;
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
          return false;
        }
      },
      
      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },
      
      checkSessionTimeout: () => {
        const { lastActivity, sessionTimeout, isAuthenticated } = get();
        
        if (!isAuthenticated) return false;
        
        const now = Date.now();
        const isTimedOut = now - lastActivity > sessionTimeout;
        
        if (isTimedOut) {
          get().logout();
          return true;
        }
        
        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Listener para mudanças na sessão
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.setState({
      user: session.user,
      isAuthenticated: true,
      lastActivity: Date.now(),
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      profile: null,
      isAuthenticated: false,
    });
  }
});
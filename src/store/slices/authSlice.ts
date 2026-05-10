import type { User, Session } from '@supabase/supabase-js';

export interface AuthSlice {
  user: User | null;
  session: Session | null;
  isAuthModalOpen: boolean;
  authModalView: 'signin' | 'signup';
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setAuthModalOpen: (isOpen: boolean, view?: 'signin' | 'signup') => void;
}

export const createAuthSlice = (
  set: (fn: (state: AuthSlice) => Partial<AuthSlice>) => void
): AuthSlice => ({
  user: null,
  session: null,
  isAuthModalOpen: false,
  authModalView: 'signin',
  setUser: (user) => set(() => ({ user })),
  setSession: (session) => set(() => ({ session })),
  setAuthModalOpen: (isOpen, view) => set(() => ({ 
    isAuthModalOpen: isOpen, 
    authModalView: view || 'signin' 
  })),
});

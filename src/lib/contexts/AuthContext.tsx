'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useSupabase } from '@/lib/SupabaseContext';

type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const profileFetchInProgress = useRef<boolean>(false);
  const currentUserId = useRef<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string): Promise<void> => {
    if (profileFetchInProgress.current || currentUserId.current === userId) {
      return;
    }

    profileFetchInProgress.current = true;
    currentUserId.current = userId;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
        setUserProfile(null);
      } else if (profile) {
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setUserProfile(null);
    } finally {
      profileFetchInProgress.current = false;
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserProfile(null);
      currentUserId.current = null;
    } catch (e) {
      console.error('Logout failed', e);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    let isInitialMount = true;

    setIsLoading(true);
    setIsAuthenticated(false);
    setUserProfile(null);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          setIsAuthenticated(true);
          if (currentUserId.current !== session.user.id) {
            currentUserId.current = null;
          }
          await fetchUserProfile(session.user.id);
        } else {
          setIsAuthenticated(false);
          setUserProfile(null);
          currentUserId.current = null;
        }
      } catch (err) {
        console.error('Auth state change failed:', err);
        setIsAuthenticated(false);
        setUserProfile(null);
        currentUserId.current = null;
      } finally {
        if (mounted && isInitialMount) {
          setIsLoading(false);
          isInitialMount = false;
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, supabase]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    userProfile,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}


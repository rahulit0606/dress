import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
  showroom_name?: string;
  subscription_plan?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, showroomName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('showroom_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const { data: authUser } = await supabase.auth.getUser();
      
      setUser({
        id: userId,
        email: authUser.user?.email || '',
        showroom_name: data?.showroom_name,
        subscription_plan: data?.subscription_plan || 'basic',
        role: data?.role || 'owner'
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set a basic user object even if profile fetch fails
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        setUser({
          id: userId,
          email: authUser.user.email || '',
          showroom_name: 'My Showroom',
          subscription_plan: 'basic',
          role: 'owner'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      // Don't set loading to false here, let the auth state change handle it
      return {};
    } catch (error) {
      setLoading(false);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, showroomName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        // Create showroom profile
        const { error: profileError } = await supabase
          .from('showroom_profiles')
          .insert([
            {
              id: data.user.id,
              showroom_name: showroomName,
              subscription_plan: 'basic',
              role: 'owner'
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      setLoading(false);
      return {};
    } catch (error) {
      setLoading(false);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
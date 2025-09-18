import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug logging to check if environment variables are loaded
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);
console.log('Supabase Key length:', supabaseAnonKey.length);

// Check if we have valid credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_project_url_here' && supabaseAnonKey !== 'your_anon_key_here';

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

  // Early return if no valid credentials
  useEffect(() => {
    if (!hasValidCredentials) {
      console.error('Invalid Supabase credentials. Please check your .env file.');
      setLoading(false);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasValidCredentials) return;

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
  }, [hasValidCredentials]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('showroom_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch error:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            // Create profile for existing user
            const { error: insertError } = await supabase
              .from('showroom_profiles')
              .insert([
                {
                  id: userId,
                  showroom_name: authUser.user.email?.split('@')[0] || 'My Showroom',
                  email: authUser.user.email,
                  subscription_plan: 'basic',
                  role: 'owner'
                }
              ]);
            
            if (insertError) {
              console.warn('Error creating profile:', insertError);
            }
          }
        }
      }

      const { data: authUser } = await supabase.auth.getUser();
      
      setUser({
        id: userId,
        email: authUser.user?.email || '',
        showroom_name: data?.showroom_name || authUser.user?.email?.split('@')[0] || 'My Showroom',
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
          showroom_name: authUser.user.email?.split('@')[0] || 'My Showroom',
          subscription_plan: 'basic',
          role: 'owner'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!hasValidCredentials) {
      return { error: 'Supabase is not properly configured. Please check your environment variables.' };
    }

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
    if (!hasValidCredentials) {
      return { error: 'Supabase is not properly configured. Please check your environment variables.' };
    }

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
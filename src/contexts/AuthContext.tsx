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
      
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('showroom_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch result:', { data, error });

      if (error) {
        console.warn('Profile fetch error:', error.message, error.code);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            // Create profile for existing user
            const { data: newProfile, error: insertError } = await supabase
              .from('showroom_profiles')
              .insert([
                {
                  id: userId,
                  showroom_name: authUser.user.user_metadata?.showroom_name || authUser.user.email?.split('@')[0] || 'My Showroom',
                  email: authUser.user.email,
                  subscription_plan: 'basic',
                  role: 'owner'
                }
              ])
              .select()
              .single();
            
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              console.log('Profile created successfully:', newProfile);
              // Use the newly created profile
              setUser({
                id: userId,
                email: authUser.user.email || '',
                showroom_name: newProfile.showroom_name,
                subscription_plan: newProfile.subscription_plan,
                role: newProfile.role
              });
              setLoading(false);
              return;
            }
          }
        }
        
        // If we can't create profile or other error, use fallback
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          console.log('Using fallback user data');
          setUser({
            id: userId,
            email: authUser.user.email || '',
            showroom_name: authUser.user.user_metadata?.showroom_name || authUser.user.email?.split('@')[0] || 'My Showroom',
            subscription_plan: 'basic',
            role: 'owner'
          });
        }
        setLoading(false);
        return;
      }

      // Profile found successfully
      console.log('Profile loaded successfully:', data);
      setUser({
        id: userId,
        email: data.email || '',
        showroom_name: data.showroom_name,
        subscription_plan: data.subscription_plan,
        role: data.role
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
        options: {
          data: {
            showroom_name: showroomName
          }
        }
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        console.log('User signed up, creating profile...');
        // Create showroom profile
        const { data: profile, error: profileError } = await supabase
          .from('showroom_profiles')
          .insert([
            {
              id: data.user.id,
              showroom_name: showroomName,
              email: email,
              subscription_plan: 'basic',
              role: 'owner'
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          console.log('Profile created during signup:', profile);
        }
      }

      setLoading(false);
      return {};
    } catch (error) {
      console.error('Signup error:', error);
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
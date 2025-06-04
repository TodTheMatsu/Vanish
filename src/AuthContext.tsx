import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean; // added
  login: (email: string, password: string) => Promise<string>;
  signup: (email: string, username: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // new state

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false); // done loading session
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return error.message;
    }
    
    // Wait for the session to be established
    if (data.session) {
      setIsAuthenticated(true);
      // Small delay to ensure auth state is propagated
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return "";
  };

  const signup = async (email: string, username: string, password: string): Promise<string> => {
    // Sanitize username: remove spaces and special characters, convert to lowercase.
    const normalizedUsername = username.replace(/\s+/g, '').toLowerCase();
    const sanitizedUsername = normalizedUsername.replace(/[^a-z0-9]/g, '');
    if (normalizedUsername !== sanitizedUsername) {
      return 'Username must only contain letters and numbers. Please remove special characters.';
    }
    if (sanitizedUsername.length === 0) {
      return 'Invalid username';
    }
    
    // Create user via Supabase Auth.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: sanitizedUsername }
      }
    });
    if (signUpError) {
      return signUpError.message;
    }
    if (!signUpData.user?.id) {
      return 'User ID not found after signup';
    }

    // Save username and user_id in profiles table.
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: signUpData.user.id,  // Added user_id field for non-null constraint
          username: sanitizedUsername,
          display_name: sanitizedUsername,
          email
        }
      ]);
    if (profileError) {
      return profileError.message;
    }

    setIsAuthenticated(true);
    return "";
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

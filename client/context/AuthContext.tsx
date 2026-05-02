import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  region?: string;
  ville?: string;
  adresse?: string;
  age?: number;
  token?: string;
  role?: 'normal' | 'scout' | 'admin';
}

// Local storage key for token persistence
const TOKEN_STORAGE_KEY = 'shm_auth_token';
const USER_STORAGE_KEY = 'shm_user_profile';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isScout: boolean;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and listen for changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id, session.user.email || "");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id, session.user.email || "");
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, userEmail: string = "") => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Profile doesn't exist yet, create a basic one
        console.log("Creating new user profile...");
        const newProfile: UserProfile = {
          id: userId,
          email: userEmail,
          role: "normal",
        };
        setUserProfile(newProfile);
      } else {
        setUserProfile(data as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        return { error: signUpError };
      }

      // Create user profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              nom: userData.nom || "",
              prenom: userData.prenom || "",
              telephone: userData.telephone || null,
              ville: userData.ville || null,
              region: userData.region || null,
              adresse: userData.adresse || null,
              age: userData.age || null,
            },
          ]);

        if (profileError) {
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // New login method for backend auth system
  const login = (userData: UserProfile) => {
    setUserProfile(userData);
    // Also set a basic user object for compatibility
    if (userData.email) {
      setUser({
        id: userData.id,
        email: userData.email,
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isScout = userProfile?.role === "scout";
  const isAuthenticated = !!userProfile?.token || !!userProfile?.id;

  // New logout method for backend auth system
  const logout = async () => {
    // Token is kept only in memory (AuthContext state)
    // Clear all auth state on logout
    setUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isScout,
    isAuthenticated,
    login,
    logout,
    signInWithOtp,
    verifyOtp,
    signUp,
    signIn,
    resetPassword,
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

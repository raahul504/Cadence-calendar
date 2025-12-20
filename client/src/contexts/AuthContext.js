// Auth Context - Manages authentication state across the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authHelpers, profileHelpers } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Load user profile
  const loadUserProfile = async (userId) => {
    if (!userId) {
      console.error('No userId provided to loadUserProfile');
      setProfile(null);
      return;
    }

    try {
      console.log('Loading profile for user:', userId);
      
      // Add a timeout for the profile fetch itself
      const profilePromise = profileHelpers.getProfile(userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (error) {
        console.error('Error from getProfile:', error);
        
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
          console.log('Profile not found, user can continue without profile');
          setProfile(null);
          return;
        }
        
        throw error;
      }
      
      console.log('Profile loaded successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Allow user to continue even if profile fails to load
      setProfile(null);
    }
  };

  // Load user session on mount
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    // Safety timeout - if auth doesn't resolve in 10 seconds, stop loading
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    // Get initial session
    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('Component unmounted, skipping auth init');
          return;
        }

        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }

        console.log('Session loaded:', session ? 'Found' : 'None');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Loading profile for user:', session.user.id);
          await loadUserProfile(session.user.id);
        } else {
          console.log('No session, skipping profile load');
          setProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Always ensure we reset state on error
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          console.log('Auth initialization complete, setting loading to false');
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Try to load profile, but don't block on it
          loadUserProfile(session.user.id).catch(err => {
            console.error('Failed to load profile in auth state change:', err);
          });
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await authHelpers.signUp(email, password, fullName);
      if (error) throw error;
      
      // Note: Profile will be created automatically by Supabase trigger
      // or we handle it in onAuthStateChange
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    try {
      const { data, error } = await authHelpers.signIn(email, password);
      if (error) throw error;
      // Session will be set by onAuthStateChange listener
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await authHelpers.signOut();
      if (error) throw error;
      // Clear state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      const { data, error } = await profileHelpers.updateProfile(user.id, updates);
      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await authHelpers.resetPassword(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
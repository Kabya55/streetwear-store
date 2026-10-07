'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check localStorage first for instant load
    const savedUser = localStorage.getItem('miralou_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('miralou_user');
      }
    }

    // Verify with backend session
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('miralou_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include',
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const userData: User = {
              id: data.user._id || data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              avatar: data.user.avatar,
            };
            setUser(userData);
            localStorage.setItem('miralou_user', JSON.stringify(userData));
          }
        } else {
          // session expired or invalid
          if (!savedUser) {
            setUser(null);
          }
        }
      } catch (e) {
        // keep offline/local state if server check fails
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [apiUrl]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
        };
        setUser(userData);
        localStorage.setItem('miralou_user', JSON.stringify(userData));
        if (data.token) localStorage.setItem('miralou_token', data.token);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
        };
        setUser(userData);
        localStorage.setItem('miralou_user', JSON.stringify(userData));
        if (data.token) localStorage.setItem('miralou_token', data.token);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('miralou_user');
    localStorage.removeItem('miralou_token');
    localStorage.removeItem('miralou_streetwear_cart');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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

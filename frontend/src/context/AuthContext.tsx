import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { clearTokens, getAccessToken, setTokens } from '@/utils/tokenStorage';
import type { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.me();
      const currentUser = data?.data?.user || data?.user || (data?.email ? data : null);
      setUser(currentUser);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authService.login({ email, password });
    const accessToken = data?.data?.accessToken || data?.accessToken || data?.token;
    const refreshToken = data?.data?.refreshToken || data?.refreshToken;
    const userData = data?.data?.user || data?.user;

    setTokens({ accessToken, refreshToken });
    if (userData) setUser(userData);
    toast.success('Welcome back!');
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authService.register({ name, email, password });
    const accessToken = data?.data?.accessToken || data?.accessToken || data?.token;
    const refreshToken = data?.data?.refreshToken || data?.refreshToken;
    const userData = data?.data?.user || data?.user;

    setTokens({ accessToken, refreshToken });
    if (userData) setUser(userData);
    toast.success('Account created! Please verify your email.');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network errors on logout */
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type AuthUser, getAuthToken, setAuthToken, loginUser, registerUser } from '../lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodePayload(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const payload = decodePayload(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({
          id: String(payload.sub),
          email: payload.email,
          role: payload.role,
          firstName: '',
          lastName: '',
          phone: '',
        });
      } else {
        setAuthToken(null);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    setAuthToken(result.token);
    setUser(result.user);
  };

  const register = async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
    const result = await registerUser(payload);
    setAuthToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const token = getAuthToken();
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

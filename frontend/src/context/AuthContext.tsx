import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from '../api/client';

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

interface DecodedToken {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  exp: number;
  iss: string;
  aud: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (googleCredential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

function parseUser(token: string, email: string, name: string, role: string): AuthUser {
  const decoded = jwtDecode<DecodedToken>(token);
  return {
    userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    email,
    name,
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = getStoredToken();
  const [token, setToken] = useState<string | null>(storedToken);
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!storedToken) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(storedToken);
      return {
        userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: '',
        name: '',
        role: '',
      };
    } catch {
      return null;
    }
  });

  const login = useCallback(async (googleCredential: string) => {
    const data = await apiFetch<AuthResponse>('/api/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ idToken: googleCredential }),
    });

    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(parseUser(data.token, data.email, data.name, data.role));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

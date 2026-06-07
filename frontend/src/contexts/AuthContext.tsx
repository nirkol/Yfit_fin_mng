import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: 'admin' | 'trainer' | null;
  userName: string | null;
  trainerId: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT token
function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'trainer' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setIsAuthenticated(true);
        setUserRole(decoded.role || 'admin');
        setUserName(decoded.name || null);
        setTrainerId(decoded.trainerId || null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, password);
      localStorage.setItem('authToken', response.token);

      // Decode token to get user info
      const decoded = decodeToken(response.token);
      setIsAuthenticated(true);
      setUserRole(decoded?.role || 'admin');
      setUserName(decoded?.name || null);
      setTrainerId(decoded?.trainerId || null);

      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    setTrainerId(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      userRole,
      userName,
      trainerId,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const AUTH_API_URL = 'http://localhost:5000/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch(`${AUTH_API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async ({ email, password, role, remember }) => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role,
        remember,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to sign in.');
    }

    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  const register = async (registrationData) => {
    const formData = new FormData();

    Object.entries(registrationData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to create account.');
    }

    return data.user;
  };

  const logout = async () => {
    try {
      await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

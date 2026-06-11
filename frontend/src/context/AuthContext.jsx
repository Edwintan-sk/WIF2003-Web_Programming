import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axiosInstance';

const AuthContext = createContext(null);

const getRequestMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data.user;
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
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
        role,
        remember,
      });

      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data.user;
    } catch (error) {
      throw new Error(getRequestMessage(error, 'Unable to sign in.'));
    }
  };

  const register = async (registrationData) => {
    const formData = new FormData();

    Object.entries(registrationData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      const response = await api.post('/api/auth/register', formData);
      return response.data.user;
    } catch (error) {
      throw new Error(getRequestMessage(error, 'Unable to create account.'));
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data.message;
    } catch (error) {
      throw new Error(
        getRequestMessage(error, 'Unable to request a password reset.')
      );
    }
  };

  const resetPassword = async (
    token,
    password,
    confirmPassword
  ) => {
    try {
      const response = await api.post(`/api/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });

      setUser(null);
      setIsAuthenticated(false);
      return response.data.message;
    } catch (error) {
      throw new Error(
        getRequestMessage(error, 'Unable to reset the password.')
      );
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
        requestPasswordReset,
        resetPassword,
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

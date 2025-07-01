import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken as setTokenInStorage, removeToken } from './api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password:string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithToken: (token: string) => void; // <-- AÑADIDO: Para manejar el login de Google
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(getToken());

  useEffect(() => {
    if (token) {
      api.me().then(setUser).catch(() => {
        removeToken();
        setToken(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setTokenInStorage(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } catch (e: any) {
      setError(e.message);
      removeToken();
      setToken(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await api.register(username, email, password);
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
      removeToken();
      setToken(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setToken(null);
  };

  // --- FUNCIÓN AÑADIDA ---
  // Esta función recibe el token de la URL (después del redirect de Google)
  // y lo establece como el token activo.
  const loginWithToken = (newToken: string) => {
    setTokenInStorage(newToken);
    setToken(newToken);
    // El useEffect se encargará de obtener los datos del usuario con api.me()
  };
  // --- FIN DE LA FUNCIÓN AÑADIDA ---

  return (
    // Se añade loginWithToken al valor del Provider
    <AuthContext.Provider value={{ user, token, login, register, logout, loginWithToken, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
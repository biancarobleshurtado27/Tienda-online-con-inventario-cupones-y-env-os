import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSessionMe, loginUser, logoutUser, registerCustomer } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Consultar sesión activa en el backend al montar la aplicación
  const checkAuth = async () => {
    try {
      const res = await getSessionMe();
      if (res?.ok && res?.usuario) {
        setUser(res.usuario);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 significa que no hay sesión activa, comportamiento esperado
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Inicio de sesión para cualquier rol
   */
  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res?.ok && res?.usuario) {
      setUser(res.usuario);
      return res.usuario;
    }
    throw new Error(res?.error || 'No se pudo iniciar sesión');
  };

  /**
   * Registro exclusivo de clientes
   */
  const register = async (customerData) => {
    const res = await registerCustomer(customerData);
    if (res?.ok && res?.usuario) {
      setUser(res.usuario);
      return res.usuario;
    }
    throw new Error(res?.error || 'No se pudo completar el registro');
  };

  /**
   * Cierre de sesión
   */
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Ignorar fallo de red al cerrar sesión
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isStaff: user?.rol === 'personal',
    isCustomer: user?.rol === 'cliente',
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

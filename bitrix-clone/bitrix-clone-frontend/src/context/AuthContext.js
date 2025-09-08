/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: AuthContext.jsx
Descripción: Contexto de autenticación para la aplicación React.
Propósito: Proveer información del usuario autenticado, el token JWT, y funciones para login, logout y actualización de usuario a cualquier componente que lo necesite.
Dependencias:
    - react: Biblioteca principal para crear componentes y contextos.
    - useState, createContext, useContext: Hooks de React para manejar estado y contexto.

Exports:
    - AuthProvider: Componente proveedor que envuelve la aplicación y provee los datos de autenticación.
    - useAuth: Hook personalizado para consumir fácilmente el contexto de autenticación.
*/

import React, { createContext, useState, useContext } from "react";

// Creamos el contexto de autenticación
const AuthContext = createContext();

// Componente proveedor que envuelve la aplicación
export const AuthProvider = ({ children }) => {
  // Estado del usuario inicializado desde localStorage si existe
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      return storedUser || null;
    } catch (error) {
      console.log("Error al leer el usuario de localStorage:", error);
      return null;
    }
  });

  // Estado del token inicializado desde localStorage si existe
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  // Función para iniciar sesión: guarda user y token en estado y localStorage
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Función para cerrar sesión: limpia estado y localStorage
  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Función para actualizar los datos del usuario y sincronizarlos con localStorage
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

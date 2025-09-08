/*
Autores:
Michael Israel Guamán Caisaluisa

Archivo: App.jsx
Descripción: Componente principal de la aplicación React.
Propósito: Configurar el enrutamiento de la aplicación y envolver la app en el contexto de autenticación.
Dependencias:
    - react-router-dom: Manejo de rutas y navegación en la aplicación.
    - AuthProvider: Contexto de autenticación para manejar usuario y token globalmente.
    - ProtectedRoute: Componente para proteger rutas que requieren autenticación.
    - Login, Register, Dashboard, ChatPage, Profile: Páginas y componentes de la app.
*/

import { BrowserRouter, Routes, Route } from "react-router-dom"; // Importa componentes para manejo de rutas
import { AuthProvider } from "./context/AuthContext"; // Contexto de autenticación
import ProtectedRoute from "./routes/ProtectedRoute"; // Ruta protegida para usuarios autenticados
import Login from "./pages/Login"; // Página de inicio de sesión
import Register from "./pages/Register"; // Página de registro
import Dashboard from "./components/Dashboard"; // Componente principal del panel de usuario
import ChatPage from "./pages/ChatPage"; // Página principal de chat
import Profile from './components/Profile'; // Componente de perfil de usuario

function App() {
  return (
    // Provee el contexto de autenticación a toda la aplicación
    <AuthProvider>
      <BrowserRouter> {/* Contenedor para manejo de rutas con React Router */}
        <Routes>
          {/* Ruta pública de login */}
          <Route path="/login" element={<Login/>}/>

          {/* Ruta pública de registro */}
          <Route path="/register" element={<Register/>}/>

          {/* Rutas protegidas que requieren autenticación */}
          {/* Dashboard maneja todas las subrutas que empiecen con /dashboard */}
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          
          {/* Ruta protegida de chat */}
          <Route path="/chat" element={<ProtectedRoute><ChatPage/></ProtectedRoute>} />

          {/* Ruta por defecto: cualquier otra ruta redirige a login */}
          <Route path="*" element={<Login/>}/>

          {/* Ruta de perfil */}
          <Route path="profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; // Exporta el componente principal

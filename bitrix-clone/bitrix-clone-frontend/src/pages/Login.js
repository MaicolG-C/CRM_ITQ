/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Login.jsx
Descripción: Componente de inicio de sesión de la aplicación.
Propósito: Permitir a los usuarios autenticarse mediante email/usuario y contraseña, gestionar sesión con JWT y mostrar modales de error o soporte.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - api: Configuración para realizar peticiones HTTP al backend.
    - useAuth: Contexto de autenticación que maneja login, logout y actualización de usuario.
    - useNavigate, Link: Navegación entre rutas de React Router.
*/

import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados para formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados para modales
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Función para manejar envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/login", { email, password });
      console.log("Respuesta completa del backend en Login:", res.data);

      // Guardar usuario y token en contexto y localStorage
      login(res.data.user, res.data.token);
      navigate("/dashboard"); // Redirigir al dashboard
    } catch (err) {
      const msg = err.response?.data?.msg || "Error de login";
      console.error("Error de login:", msg);
      setErrorMessage(msg);
      setShowModal(true); // Abrir modal de error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white flex w-full h-screen">
        {/* Sección visual izquierda */}
        <div
          className="flex-1 bg-red-600 bg-cover bg-center hidden md:flex flex-col justify-center items-center relative"
          style={{
            backgroundImage: `url('https://itq.edu.ec/wp-content/uploads/2024/08/chicha-ITQ-carreras-pienso-itq-t.png')`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Sección de formulario */}
        <div className="w-full md:flex-1 p-8 flex flex-col justify-center">
          <p className="text-red-600 text-2xl font-bold text-center mb-4">
            Instituto Superior Tecnológico Quito
          </p>
          <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
            Iniciar Sesión
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-sm mx-auto w-full"
          >
            {/* Email */}
            <label htmlFor="email" className="text-gray-700 text-sm font-bold">
              Usuario o Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {/* Contraseña */}
            <label
              htmlFor="password"
              className="text-gray-700 text-sm font-bold"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                required
                className="p-3 border border-gray-300 rounded-md w-full pr-10 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {/* Icono mostrar/ocultar contraseña */}
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11A6 6 0 0113.476 14.89z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M.458 10c1.274-4.057 5.064-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zm7.542 0a2 2 0 114 0 2 2 0 01-4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Botón de inicio */}
            <button
              type="submit"
              className="bg-red-600 text-white p-3 rounded-md font-semibold hover:bg-red-700 transition duration-300"
            >
              Entrar
            </button>
          </form>

          {/* Enlaces de soporte y registro */}
          <div className="text-center mt-4 text-gray-600">
            <button
              onClick={() => setShowSupportModal(true)}
              className="text-red-600 hover:underline text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <p className="mt-2 text-sm">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-red-600 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de error */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Error de Inicio de Sesión
            </h3>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de soporte */}
      {showSupportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Recuperación de Contraseña
            </h3>
            <p className="text-gray-700 mb-4">
              Para restablecer tu contraseña comunícate con el área de soporte
              técnico.
            </p>
            <p className="text-gray-900 font-semibold mb-4">
              📞 09 3903 7562
            </p>
            <button
              onClick={() => setShowSupportModal(false)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

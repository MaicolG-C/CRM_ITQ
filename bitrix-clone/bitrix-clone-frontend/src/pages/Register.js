/*
Autores:
Michael Israel Guamán Caisaluisa

Archivo: Register.jsx
Descripción: Componente de registro de usuarios en varios pasos.
Propósito: Permitir a los usuarios registrarse completando información personal, uso del servicio y datos de la empresa.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-router-dom: Para la navegación entre rutas (useNavigate).
    - api: Configuración personalizada para hacer peticiones HTTP al backend.
*/

import { useState } from "react";
import api from "../api"; // Configuración de la API para enviar datos al backend
import { useNavigate } from "react-router-dom"; // Hook para redirigir al usuario

const Register = () => {
  const navigate = useNavigate(); // Permite cambiar de página al completar registro

  // Estado para controlar el paso actual del registro (1, 2, 3)
  const [currentStep, setCurrentStep] = useState(1);

  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    serviceUsage: "",
    role: "",
    experience: false,
    companyName: "",
    businessAddress: "",
    numEmployees: "",
  });

  // Estado para manejar errores de validación por cada campo
  const [errors, setErrors] = useState({});

  // Estados para mostrar u ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para mostrar modales de éxito y error
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Función que actualiza los valores del formulario al escribir o seleccionar opciones
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Validaciones por pasos ---
  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Nombres es obligatorio";
    if (!formData.lastName) newErrors.lastName = "Apellidos es obligatorio";
    if (!formData.email) newErrors.email = "Email es obligatorio";
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!formData.password) newErrors.password = "Contraseña es obligatoria";
    if (formData.password.length < 6)
      newErrors.password = "Contraseña debe tener al menos 6 caracteres";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (!formData.phone) newErrors.phone = "Número de teléfono es obligatorio";
    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Número de teléfono inválido (10 dígitos)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.serviceUsage)
      newErrors.serviceUsage = "Selecciona para qué usarás el servicio";
    if (!formData.role) newErrors.role = "Selecciona tu cargo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    let newErrors = {};
    if (!formData.companyName)
      newErrors.companyName = "Nombre de la empresa es obligatorio";
    if (!formData.businessAddress)
      newErrors.businessAddress = "Dirección de negocios es obligatoria";
    if (!formData.numEmployees)
      newErrors.numEmployees = "Selecciona el número de empleados";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funciones para navegar entre pasos
  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();

    if (isValid) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Envío de formulario al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    try {
      const { confirmPassword, ...dataToSend } = formData; // Excluye confirmPassword
      await api.post("/users/register", dataToSend); // Enviar datos
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || "Error de registro");
      setShowErrorModal(true);
    }
  };

  // Renderizado condicional de los pasos
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        // JSX del Paso 1: datos personales
        break;
      case 2:
        // JSX del Paso 2: uso del servicio y cargo
        break;
      case 3:
        // JSX del Paso 3: información de la empresa
        break;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-gray-900 bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      {/* Contenedor principal del formulario */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row transform transition-all duration-500 scale-95 hover:scale-100">
        {/* Formulario */}
        <div className="w-full md:w-2/3 p-4 flex flex-col justify-center">
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
            {renderStep()}
          </form>
        </div>
      </div>

      {/* Modal de error */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">Error de Registro</h3>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-green-600 mb-2">¡Registro Exitoso!</h3>
            <p className="text-gray-700 mb-4">Tu cuenta ha sido creada. Ahora puedes iniciar sesión.</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

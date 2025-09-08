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
import api from "../api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState({ type: null, text: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Nombres es obligatorio";
    if (!formData.lastName) newErrors.lastName = "Apellidos es obligatorio";
    if (!formData.email) newErrors.email = "Email es obligatorio";
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = "Email inválido";
    if (!formData.password) newErrors.password = "Contraseña es obligatoria";
    if (formData.password.length < 6) newErrors.password = "Contraseña debe tener al menos 6 caracteres";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (!formData.phone) newErrors.phone = "Número de teléfono es obligatorio";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Número de teléfono inválido (10 dígitos)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.serviceUsage) newErrors.serviceUsage = "Selecciona para qué usarás el servicio";
    if (!formData.role) newErrors.role = "Selecciona tu cargo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    let newErrors = {};
    if (!formData.companyName) newErrors.companyName = "Nombre de la empresa es obligatorio";
    if (!formData.businessAddress) newErrors.businessAddress = "Dirección de negocios es obligatoria";
    if (!formData.numEmployees) newErrors.numEmployees = "Selecciona el número de empleados";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    try {
      const { confirmPassword, ...dataToSend } = formData; // Exclude confirmPassword
      await api.post("/users/register", dataToSend);
      setRegistrationSuccess(true);
    } catch (err) {
      setRegistrationMessage({ type: 'error', text: err.response?.data?.msg || "Error de registro" });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-2xl font-bold mb-3 text-center text-red-600 col-span-1 md:col-span-2">Paso 1: Valida tu Correo</h2>
            <div>
              <label htmlFor="name" className="text-gray-700 text-sm font-bold">Nombres</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Nombres" className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="text-gray-700 text-sm font-bold">Apellidos</label>
              <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellidos" className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="text-gray-700 text-sm font-bold">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Email" className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="text-gray-700 text-sm font-bold">Número de Teléfono</label>
              <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="Número de Teléfono" className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="password" className="text-gray-700 text-sm font-bold">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" id="password" value={formData.password} onChange={handleChange} placeholder="Crear Contraseña" className="p-3 rounded-lg border-2 border-gray-300 w-full pr-12 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-300" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-red-500 transition-colors duration-200">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11A6 6 0 0113.476 14.89z" clipRule="evenodd" /><path fillRule="evenodd" d="M.458 10c1.274-4.057 5.064-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zm7.542 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="confirmPassword" className="text-gray-700 text-sm font-bold">Confirmar Contraseña</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmar Contraseña" className="p-3 rounded-lg border-2 border-gray-300 w-full pr-12 transition-all duration-300" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-red-500 transition-colors duration-200">
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11A6 6 0 0113.476 14.89z" clipRule="evenodd" /><path fillRule="evenodd" d="M.458 10c1.274-4.057 5.064-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zm7.542 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <button type="button" onClick={handleNext} className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transform transition-transform duration-300 hover:scale-105 col-span-1 md:col-span-2 shadow-lg">Siguiente</button>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-2xl font-bold mb-3 text-center text-red-600 col-span-1 md:col-span-2">Paso 2: Habla un poco de ti</h2>
            <div>
              <label htmlFor="serviceUsage" className="text-gray-700 text-sm font-bold">¿Para qué utilizarás este servicio?</label>
              <select name="serviceUsage" id="serviceUsage" value={formData.serviceUsage} onChange={handleChange} className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300">
                <option value="">Selecciona una opción</option>
                <option value="crm">Gestión de Clientes (CRM)</option>
                <option value="sales">Gestión de Ventas</option>
                <option value="marketing">Marketing Digital</option>
                <option value="project_management">Gestión de Proyectos</option>
                <option value="other">Otro</option>
              </select>
              {errors.serviceUsage && <p className="text-red-500 text-xs mt-1">{errors.serviceUsage}</p>}
            </div>

            <div>
              <label htmlFor="role" className="text-gray-700 text-sm font-bold">¿Cuál es el cargo que ocuparás?</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300">
                <option value="">Selecciona una opción</option>
                <option value="admin">Administrador</option>
                <option value="sales_rep">Representante de Ventas</option>
                <option value="manager">Gerente</option>
                <option value="employee">Empleado</option>
                <option value="owner">Propietario</option>
                <option value="other">Otro</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="text-gray-700 text-sm font-bold">¿Tienes experiencia previa usando estas plataformas?</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-gray-700">
                  <input type="radio" name="experience" value="true" checked={formData.experience === true} onChange={handleChange} className="form-radio text-red-600" /> Sí
                </label>
                <label className="flex items-center gap-2 text-gray-700">
                  <input type="radio" name="experience" value="false" checked={formData.experience === false} onChange={handleChange} className="form-radio text-red-600" /> No
                </label>
              </div>
            </div>

            <div className="flex justify-between col-span-1 md:col-span-2 mt-4">
              <button type="button" onClick={handlePrev} className="bg-gray-400 text-white p-3 rounded-lg hover:bg-gray-500 transform transition-transform duration-300 hover:scale-105 shadow-lg">Anterior</button>
              <button type="button" onClick={handleNext} className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transform transition-transform duration-300 hover:scale-105 shadow-lg">Siguiente</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-2xl font-bold mb-3 text-center text-red-600 col-span-1 md:col-span-2">Paso 3: Sobre tu empresa</h2>
            <div>
              <label htmlFor="companyName" className="text-gray-700 text-sm font-bold">Nombre de la Empresa</label>
              <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} placeholder="Nombre de la Empresa" className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300" />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label htmlFor="businessAddress" className="text-gray-700 text-sm font-bold">Dirección de Negocios</label>
              <input type="text" name="businessAddress" id="businessAddress" value={formData.businessAddress} onChange={handleChange} placeholder="Dirección de Negocios" className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300" />
              {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>}
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="numEmployees" className="text-gray-700 text-sm font-bold">¿Cuántas personas trabajan?</label>
              <select name="numEmployees" id="numEmployees" value={formData.numEmployees} onChange={handleChange} className="p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full transition-all duration-300">
                <option value="">Selecciona una opción</option>
                <option value="1">Solo yo</option>
                <option value="2-5">2-5</option>
                <option value="6-10">6-10</option>
                <option value="11-30">11-30</option>
                <option value="31-50">31-50</option>
                <option value="50+">Más de 50</option>
              </select>
              {errors.numEmployees && <p className="text-red-500 text-xs mt-1">{errors.numEmployees}</p>}
            </div>

            <div className="flex justify-between col-span-1 md:col-span-2 mt-4">
              <button type="button" onClick={handlePrev} className="bg-gray-400 text-white p-3 rounded-lg hover:bg-gray-500 transform transition-transform duration-300 hover:scale-105 shadow-lg">Anterior</button>
              <button type="submit" onClick={handleSubmit} className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transform transition-transform duration-300 hover:scale-105 shadow-lg">Finalizar</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-gray-900 bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
    >
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row transform transition-all duration-500 scale-95 hover:scale-100">
        {/* Panel Izquierdo: Indicador de progreso */}
        <div className="w-full md:w-1/3 p-4 border-b md:border-r md:border-b-0 border-gray-300 mb-4 md:mb-0">
          <h3 className="text-2xl font-extrabold mb-6">Progreso de Registro</h3>
          <ul className="space-y-6">
            {[1, 2, 3].map((stepNum) => (
              <li key={stepNum} className={`flex items-center gap-3 transition-colors duration-300 ${currentStep === stepNum ? 'text-red-600 font-extrabold' : 'text-gray-500'}`}>
                {currentStep > stepNum || registrationSuccess ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <span className={`h-8 w-8 flex items-center justify-center border-2 rounded-full font-bold transition-all duration-300 ${currentStep === stepNum ? 'bg-red-600 text-white border-red-600' : 'border-gray-400'}`}>{stepNum}</span>
                )}
                <span>{stepNum === 1 ? "Valida tu Correo" : stepNum === 2 ? "Habla un poco de ti" : "Sobre tu empresa"}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sección Derecha: Campos del formulario */}
        <div className="w-full md:w-2/3 p-4 flex flex-col justify-center">
          {registrationSuccess ? (
            <div className="text-center py-10">
              <h2 className="text-4xl font-extrabold mb-3 text-green-600">¡Registro Exitoso!</h2>
              <p className="mb-6 text-lg text-gray-700">Tu cuenta ha sido creada. Ahora puedes iniciar sesión.</p>
              <button onClick={() => navigate("/login")} className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transform transition-transform duration-300 hover:scale-105 shadow-lg">Ir a Iniciar Sesión</button>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
              {renderStep()}
            </form>
          )}
          {registrationMessage.type === 'error' && (
            <div className="mt-4 p-4 text-center rounded-lg bg-red-100 text-red-700 border border-red-400">
              <p>{registrationMessage.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;

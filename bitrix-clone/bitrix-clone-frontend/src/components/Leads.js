/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Leads.jsx
Descripción: Componente React para gestionar leads dentro de la aplicación.
Propósito: Permitir agregar, listar y filtrar leads, mostrando su nombre, email, teléfono y estado.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - api: Cliente HTTP para comunicarse con el backend.
*/

import { useEffect, useState } from "react";
import api from "../api";

const Leads = ({ search }) => {
  // Estado de los leads obtenidos del backend
  const [leads, setLeads] = useState([]);
  // Estados individuales para el formulario de nuevo lead
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("new");

  // Función para obtener los leads desde el backend
  const fetchLeads = async () => {
    const res = await api.get("/leads");
    setLeads(res.data);
  };

  // Cargar los leads al montar el componente
  useEffect(() => {
    fetchLeads();
  }, []);

  // Manejo del envío del formulario para agregar un lead
  const handleAdd = async (e) => {
    e.preventDefault();
    // Validaciones básicas
    if (!name || !email || !phone) return alert("Todos los campos obligatorios");
    if (!/^\d{10}$/.test(phone)) return alert("Teléfono inválido (10 dígitos Ecuador)");
    // Enviar nuevo lead al backend
    await api.post("/leads", { name, email, phone, status });
    // Limpiar formulario y recargar la lista
    setName("");
    setEmail("");
    setPhone("");
    setStatus("new");
    fetchLeads();
  };

  // Filtrar leads según el texto de búsqueda
  const filtered = leads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Título de la sección */}
      <h3 className="font-bold text-red-600 mb-2">Leads</h3>

      {/* Formulario para agregar un nuevo lead */}
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="border p-1 rounded"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="border p-1 rounded"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Teléfono (10 dígitos)"
          className="border p-1 rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <button
          type="submit"
          className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
        >
          Agregar
        </button>
      </form>

      {/* Lista de leads filtrados */}
      <ul>
        {filtered.map((l) => (
          <li key={l._id} className="border-b py-1">
            {l.name} - {l.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Exportamos el componente para usarlo en otros módulos
export default Leads;

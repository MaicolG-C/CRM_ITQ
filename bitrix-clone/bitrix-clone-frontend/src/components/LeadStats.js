/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: LeadStats.jsx
Descripción: Componente React para visualizar estadísticas de leads.
Propósito: Mostrar un gráfico circular (Pie Chart) con la distribución de leads según su estado: New, Contacted o Closed.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - api: Cliente HTTP para comunicarse con el backend.
    - react-chartjs-2: Para renderizar gráficos de Chart.js en React.
    - chart.js: Biblioteca de gráficos utilizada por react-chartjs-2.
*/

import { useEffect, useState } from "react";
import api from "../api";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const LeadStats = () => {
  // Estado que contiene la lista de leads
  const [leads, setLeads] = useState([]);

  // Función para obtener los leads desde el backend
  const fetchLeads = async () => {
    const res = await api.get("/leads");
    setLeads(res.data);
  };

  // Ejecutar fetch al montar el componente
  useEffect(() => { 
    fetchLeads(); 
  }, []);

  // Configuración de datos para el gráfico Pie
  const data = {
    labels: ['New', 'Contacted', 'Closed'],
    datasets: [{
      label: 'Leads',
      data: [
        leads.filter(l => l.status === 'new').length,
        leads.filter(l => l.status === 'contacted').length,
        leads.filter(l => l.status === 'closed').length
      ],
      backgroundColor: ['#FF0000','#000000','#FFFFFF'],
      borderColor: ['#000','#000','#000'],
      borderWidth: 1
    }]
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Título de la sección */}
      <h3 className="font-bold text-red-600 mb-2">Lead Statistics</h3>
      {/* Gráfico circular con los datos */}
      <Pie data={data} />
    </div>
  );
};

// Exportamos el componente para usarlo en otros módulos
export default LeadStats;

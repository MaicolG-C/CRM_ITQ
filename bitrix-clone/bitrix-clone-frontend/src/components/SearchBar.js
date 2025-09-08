/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: SearchBar.jsx
Descripción: Componente de barra de búsqueda que captura la entrada del usuario y envía los cambios al componente padre.
Propósito:
    - Permitir al usuario filtrar listas o tablas mediante un campo de búsqueda.
    - Actualizar dinámicamente la búsqueda a medida que el usuario escribe.
Props:
    - onSearch: Función que recibe el valor actual de la búsqueda y lo maneja en el componente padre.
*/

import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  // Maneja cambios en el input y notifica al padre
  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="p-2 bg-gray-100 rounded mb-4">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Buscar..."
        className="w-full p-2 rounded border"
      />
    </div>
  );
};

export default SearchBar;

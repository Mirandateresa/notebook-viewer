import React, { useState, useEffect } from 'react';
import './FileSelector.css';

const FileSelector = ({ onSelectNotebook }) => {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // En FileSelector.jsx, la función fetchNotebooks debería verse así:
useEffect(() => {
  const fetchNotebooks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notebooks');
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      
      // Asegúrate de usar el campo correcto
      // La API devuelve objetos con {filename, size, path, ...}
      setNotebooks(data);
      
    } catch (err) {
      setError('Error al cargar los notebooks: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchNotebooks();
}, []);
  if (loading) {
    return (
      <div className="loading">
        <p>Cargando notebooks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <p>Verifica que el backend esté corriendo en http://localhost:8000</p>
      </div>
    );
  }

  return (
    <div className="file-selector">
      <h2>Selecciona un Notebook</h2>
      {notebooks.length === 0 ? (
        <p>No se encontraron notebooks en el directorio.</p>
      ) : (
        <div className="notebook-list">
          {notebooks.map((notebook, index) => (
            <div 
              key={index}
              className="notebook-item"
              onClick={() => onSelectNotebook(notebook.filename || notebook)}
            >
              <div className="notebook-icon">📓</div>
              <div className="notebook-name">
                {typeof notebook === 'string' ? notebook : notebook.filename}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSelector;

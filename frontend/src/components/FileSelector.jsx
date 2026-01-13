import React, { useState, useEffect } from 'react';
import './FileSelector.css';
import config from '../config';  // <-- AGREGAR ESTA LÍNEA

function FileSelector({ onSelectNotebook }) {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // En FileSelector.jsx, la función fetchNotebooks debería verse así:
  const fetchNotebooks = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/notebooks`);  // <-- CAMBIAR AQUÍ
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setNotebooks(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notebooks:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  if (loading) {
    return (
      <div className="file-selector">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando notebooks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-selector">
        <div className="error-container">
          <h3>Error al cargar los notebooks</h3>
          <p>{error}</p>
          <p>Verifica que el backend esté corriendo en {config.API_URL}</p>  {/* <-- CAMBIAR AQUÍ */}
          <button onClick={fetchNotebooks} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-selector">
      <h2>📓 Notebooks Disponibles</h2>
      <div className="notebooks-grid">
        {notebooks.map((notebook) => (
          <div
            key={notebook.filename}
            className="notebook-card"
            onClick={() => onSelectNotebook(notebook.filename)}
          >
            <div className="notebook-icon">📓</div>
            <div className="notebook-info">
              <h3>{notebook.filename}</h3>
              <p>Tamaño: {(notebook.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileSelector;

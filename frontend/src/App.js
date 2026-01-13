import React, { useState } from 'react';
import Header from './components/Header';
import FileSelector from './components/FileSelector';
import NotebookViewer from './components/NotebookViewer';
import './App.css';

function App() {
  const [selectedNotebook, setSelectedNotebook] = useState(null);

  const handleSelectNotebook = (filename) => {
    setSelectedNotebook(filename);
  };

  const handleBackToList = () => {
    setSelectedNotebook(null);
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        {!selectedNotebook ? (
          <FileSelector onSelectNotebook={handleSelectNotebook} />
        ) : (
          <NotebookViewer 
            filename={selectedNotebook} 
            onBack={handleBackToList}
          />
        )}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>📓 Notebook Viewer • Desarrollado con FastAPI y React</p>
          <p className="footer-links">
            <span>Backend: <a href="http://localhost:8000" target="_blank" rel="noopener noreferrer">localhost:8000</a></span>
            <span className="separator">•</span>
            <span>API: <a href="http://localhost:8000/api/notebooks" target="_blank" rel="noopener noreferrer">/api/notebooks</a></span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

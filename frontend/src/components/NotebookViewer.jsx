import React, { useState, useEffect } from 'react';
import './NotebookViewer.css';

const NotebookViewer = ({ filename, onBack }) => {
  const [notebookData, setNotebookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        console.log('🔍 Fetching notebook:', filename);
        const response = await fetch(`http://localhost:8000/api/notebooks/${filename}`);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Notebook loaded, cells:', data.cells?.length);
        setNotebookData(data);
        
      } catch (err) {
        console.error('❌ Error:', err);
        setError('Error al cargar el notebook: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotebook();
  }, [filename]);

  // Función para resaltar sintaxis básica de Python
  const highlightPythonCode = (code) => {
    if (!code) return code;
    
    // Palabras clave de Python
    const keywords = [
      'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while',
      'import', 'from', 'as', 'try', 'except', 'finally', 'with',
      'global', 'nonlocal', 'lambda', 'yield', 'async', 'await',
      'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is',
      'break', 'continue', 'pass', 'raise', 'assert', 'del'
    ];
    
    // Funciones built-in
    const builtins = [
      'print', 'len', 'range', 'type', 'str', 'int', 'float', 'list',
      'dict', 'set', 'tuple', 'enumerate', 'zip', 'map', 'filter',
      'abs', 'sum', 'min', 'max', 'sorted', 'reversed', 'open'
    ];
    
    let highlighted = code;
    
    // Resaltar keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
    });
    
    // Resaltar builtins
    builtins.forEach(builtin => {
      const regex = new RegExp(`\\b${builtin}\\b(?=\\()`, 'g');
      highlighted = highlighted.replace(regex, `<span class="function">${builtin}</span>`);
    });
    
    // Resaltar strings
    highlighted = highlighted.replace(/(['"])(.*?)\1/g, '<span class="string">$1$2$1</span>');
    
    // Resaltar números
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    
    // Resaltar comentarios
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    
    // Resaltar operadores
    const operators = ['=', '==', '!=', '<', '>', '<=', '>=', '\\+', '-', '\\*', '/', '//', '%', '\\*\\*'];
    operators.forEach(op => {
      const regex = new RegExp(`(\\s)(${op})(\\s)`, 'g');
      highlighted = highlighted.replace(regex, `$1<span class="operator">$2</span>$3`);
    });
    
    return highlighted;
  };

  const renderMarkdown = (text) => {
    let html = text || '';
    
    // Encabezados
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    
    // Negritas y cursivas
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Código en línea y en bloque
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Listas
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\+ (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Listas numeradas
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)(?!.*<li>)/gs, '<ol>$1</ol>');
    
    // Citas
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Líneas horizontales
    html = html.replace(/^-{3,}$/gm, '<hr />');
    html = html.replace(/^\*{3,}$/gm, '<hr />');
    
    // Enlaces
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Saltos de línea
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br />');
    
    return { __html: '<p>' + html + '</p>' };
  };

  const renderCell = (cell, index) => {
    if (cell.cell_type === 'markdown') {
      const markdownSource = Array.isArray(cell.source)
        ? cell.source.join('')
        : (cell.source || '');

      return (
        <div key={index} className="cell markdown-cell">
          <div className="cell-header">
            <span className="cell-type">
              <span role="img" aria-label="markdown">📝</span> Markdown
            </span>
            <span className="cell-number">#{index + 1}</span>
          </div>
          <div 
            className="cell-content"
            dangerouslySetInnerHTML={renderMarkdown(markdownSource)}
          />
        </div>
      );
    }

    if (cell.cell_type === 'code') {
      const codeSource = Array.isArray(cell.source)
        ? cell.source.join('')
        : (cell.source || '');

      return (
        <div key={index} className="cell code-cell">
          <div className="cell-header">
            <span className="cell-type">
              <span role="img" aria-label="code">💻</span> Código
            </span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {cell.execution_count && (
                <span className="execution-count">In [{cell.execution_count}]</span>
              )}
              <span className="cell-number">#{index + 1}</span>
            </div>
          </div>
          <div className="cell-content">
            <pre className="code-block">
              <code dangerouslySetInnerHTML={{ __html: highlightPythonCode(codeSource) }} />
            </pre>
          </div>

          {cell.outputs && cell.outputs.length > 0 && (
            <div className="cell-outputs">
              <div className="outputs-header">
                <span role="img" aria-label="output">📤</span> Salida
              </div>
              {cell.outputs.map((output, outputIndex) => {
                if (output.output_type === 'stream' && output.text) {
                  const text = Array.isArray(output.text)
                    ? output.text.join('')
                    : output.text;
                  return (
                    <pre key={outputIndex} className="stream-output">
                      {text}
                    </pre>
                  );
                }
                if (output.output_type === 'execute_result' && output.data) {
                  if (output.data['text/plain']) {
                    const text = Array.isArray(output.data['text/plain'])
                      ? output.data['text/plain'].join('')
                      : output.data['text/plain'];
                    return (
                      <pre key={outputIndex} className="execute-result">
                        {text}
                      </pre>
                    );
                  }
                }
                if (output.output_type === 'error') {
                  return (
                    <div key={outputIndex} className="error-output">
                      <strong>
                        <span role="img" aria-label="error">❌</span> Error:
                      </strong> {output.ename}: {output.evalue}
                      <pre>{output.traceback?.join('\n')}</pre>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={index} className="cell unknown-cell">
        <div className="cell-header">
          <span className="cell-type">
            <span role="img" aria-label="unknown">❓</span> {cell.cell_type}
          </span>
          <span className="cell-number">#{index + 1}</span>
        </div>
        <pre>{JSON.stringify(cell, null, 2)}</pre>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <p>
          <span role="img" aria-label="loading">⏳</span> 
          Cargando {filename}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>
          <span role="img" aria-label="error">❌</span> 
          {error}
        </p>
        <button onClick={onBack} className="back-button">
          <span role="img" aria-label="back">←</span> Volver a la lista
        </button>
      </div>
    );
  }

  if (!notebookData || !notebookData.cells) {
    return (
      <div className="error">
        <p>El notebook no tiene una estructura válida</p>
        <button onClick={onBack} className="back-button">
          <span role="img" aria-label="back">←</span> Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="notebook-viewer">
      <div className="viewer-container">
        <div className="viewer-header">
          <button onClick={onBack} className="back-button">
            <span role="img" aria-label="back">←</span> Volver a la lista
          </button>

          <div className="file-info">
            <h2>{filename}</h2>
            {notebookData._file_info && (
              <div className="file-details">
                <span>
                  <span role="img" aria-label="size">📦</span>
                  Tamaño: {(notebookData._file_info.size / 1024).toFixed(1)} KB
                </span>
                <span>
                  <span role="img" aria-label="cells">📄</span>
                  Celdas: {notebookData.cells.length}
                </span>
              </div>
            )}
          </div>

          <div className="viewer-tabs">
            <button
              className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <span role="img" aria-label="preview">📖</span> Vista previa
            </button>
            <button
              className={`tab-button ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              <span role="img" aria-label="json">{ }</span> JSON
            </button>
          </div>
        </div>

        <div className="notebook-content">
          {activeTab === 'preview' ? (
            <div className="cells-container">
              {notebookData.cells.map((cell, index) => renderCell(cell, index))}
            </div>
          ) : (
            <div className="json-view">
              <h3>
                <span role="img" aria-label="json">{ }</span> 
                Datos JSON completos
              </h3>
              <pre className="json-preview">
                {JSON.stringify(notebookData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotebookViewer;

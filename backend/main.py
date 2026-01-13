from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from pathlib import Path
from typing import List, Dict, Any
print(f"=== Starting Flask app ===")
print(f"PORT: {os.environ.get('PORT', 8000)}")
print(f"Environment: {os.environ.get('RENDER', 'development')}")

app = FastAPI(title="Notebook Viewer API")

# Configurar CORS para desarrollo local Y producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React dev server 1
        "http://localhost:3001",      # React dev server 2  
        "http://localhost:2808",      # Otro puerto local
        "https://notebook-viewer-1.onrender.com"  # ← ¡AGREGA ESTA LÍNEA!
    ],
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Todos los headers
)
# Ruta a los notebooks REALES
NOTEBOOKS_DIR = Path("/home/teresa/Simulacion/notebook-viewer/backend/notebooks")

@app.get("/")
def home():
    return {"message": "Notebook Viewer API", "status": "running", "notebooks_dir": str(NOTEBOOKS_DIR)}

@app.get("/api/notebooks")
def get_notebooks() -> List[Dict[str, Any]]:
    """Listar notebooks REALES del sistema de archivos"""
    try:
        print(f"📁 Listando notebooks REALES de: {NOTEBOOKS_DIR}")
        
        notebooks = []
        files_found = 0
        
        # Buscar archivos .ipynb en el directorio (REALES)
        for file_path in NOTEBOOKS_DIR.iterdir():
            if file_path.is_file() and file_path.suffix.lower() == '.ipynb':
                files_found += 1
                print(f"✅ Encontrado REAL: {file_path.name}")
                
                try:
                    file_stats = file_path.stat()
                    notebooks.append({
                        "filename": file_path.name,
                        "size": file_stats.st_size,
                        "path": str(file_path),
                        "last_modified": file_stats.st_mtime
                    })
                except Exception as e:
                    print(f"⚠️ Error leyendo {file_path.name}: {e}")
                    notebooks.append({
                        "filename": file_path.name,
                        "size": 0,
                        "path": str(file_path),
                        "error": f"No se pudo leer: {str(e)}"
                    })
        
        print(f"📊 Total notebooks REALES encontrados: {files_found}")
        print(f"📄 Lista REAL: {[n['filename'] for n in notebooks]}")
        
        # Si no se encuentran notebooks, devolver mensaje
        if not notebooks:
            return [{
                "filename": "No se encontraron notebooks",
                "size": 0,
                "path": str(NOTEBOOKS_DIR),
                "error": "No hay archivos .ipynb en el directorio"
            }]
        
        # Ordenar por nombre
        notebooks.sort(key=lambda x: x["filename"])
        return notebooks  # <-- ¡IMPORTANTE! Datos REALES, no hardcodeados
        
    except Exception as e:
        print(f"❌ Error en get_notebooks: {e}")
        raise HTTPException(status_code=500, detail=f"Error leyendo directorio: {str(e)}")

@app.get("/api/notebooks/{filename}")
def get_notebook(filename: str) -> Dict[str, Any]:
    """Leer el contenido REAL de un notebook Jupyter"""
    try:
        print(f"🔍 Buscando notebook: {filename}")
        
        # Validar que el archivo exista
        file_path = NOTEBOOKS_DIR / filename
        print(f"📁 Ruta completa: {file_path}")
        
        if not file_path.exists():
            print("⚠️ Archivo no encontrado exactamente, buscando coincidencias...")
            # Buscar archivos que coincidan (sin importar mayúsculas/minúsculas)
            all_files = list(NOTEBOOKS_DIR.glob("*.ipynb"))
            matching_files = []
            
            for f in all_files:
                if filename.lower() in f.name.lower():
                    matching_files.append(f)
            
            print(f"📊 Archivos encontrados: {[f.name for f in matching_files]}")
            
            if matching_files:
                file_path = matching_files[0]
                filename = file_path.name
                print(f"✅ Usando: {filename}")
            else:
                raise HTTPException(status_code=404, detail=f"Notebook '{filename}' no encontrado en {NOTEBOOKS_DIR}")
        
        print(f"📖 Leyendo archivo: {file_path}")
        
        # Leer el archivo .ipynb REAL
        with open(file_path, 'r', encoding='utf-8') as f:
            notebook_data = json.load(f)
        
        print(f"✅ Notebook leído exitosamente")
        print(f"📊 Número de celdas: {len(notebook_data.get('cells', []))}")
        
        # Asegurar estructura básica si falta
        if "cells" not in notebook_data:
            notebook_data["cells"] = []
        
        if "metadata" not in notebook_data:
            notebook_data["metadata"] = {}
        
        # Agregar información del archivo
        notebook_data["_file_info"] = {
            "filename": filename,
            "size": file_path.stat().st_size,
            "path": str(file_path),
            "last_modified": file_path.stat().st_mtime
        }
        
        return notebook_data  # <-- ¡IMPORTANTE! Datos REALES
        
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        print(f"❌ Error JSON: {e}")
        raise HTTPException(status_code=400, detail=f"El archivo no es un JSON válido: {str(e)}")
    except Exception as e:
        print(f"❌ Error general: {e}")
        raise HTTPException(status_code=500, detail=f"Error leyendo notebook: {str(e)}")

@app.get("/api/notebooks/{filename}/raw")
def get_notebook_raw(filename: str):
    """Obtener el notebook como texto plano (JSON crudo)"""
    try:
        file_path = NOTEBOOKS_DIR / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Notebook '{filename}' no encontrado")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "notebooks_directory": str(NOTEBOOKS_DIR),
        "directory_exists": NOTEBOOKS_DIR.exists()
    }

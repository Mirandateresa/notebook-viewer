# Notebook Viewer

A modern web application to view Jupyter Notebooks with a beautiful interface.

## Features
- 📁 Browse and list .ipynb files
- 👁️ Preview with formatted Markdown and code
- 💻 Syntax highlighting for Python
- 📊 Display code outputs and errors
- 🎨 Modern UI with gradients
- 📱 Responsive design

## Quick Start
\`\`\`bash
# Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Frontend (in another terminal)
cd frontend
npm install
npm start
\`\`\`

## Tech Stack
- Frontend: React 18
- Backend: FastAPI
- Styling: CSS3

## API Endpoints
- \`GET /api/notebooks\` - List all notebooks
- \`GET /api/notebooks/{filename}\` - Get notebook content
- \`GET /api/health\` - Health check

## License
MIT

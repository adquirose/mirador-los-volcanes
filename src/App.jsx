import { useState, useEffect } from 'react'
import PDFViewer from './components/PDFViewer'
import './components/PDFViewer.css'
import './App.css'

function App() {
  // Usar proxy en desarrollo, URL directa en producción
  const pdfUrl = import.meta.env.DEV 
    ? '/api/pdf/mirador-los-volcanes-panguipulli.pdf'  // Proxy para evitar CORS en desarrollo
    : 'https://www.lanube360.com/pdf/mirador-los-volcanes-panguipulli.pdf'; // URL directa en producción
    
  const [selectedFile, setSelectedFile] = useState(pdfUrl)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Por favor selecciona un archivo PDF válido')
    }
  }

  return (
    <div className="App">
      {isLoading ? (
        <div className="loading-screen">
          <div className="loading-content">
            <h2>🌋 Cargando Mirador Los Volcanes...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      ) : (
        <PDFViewer file={selectedFile} />
      )}
    </div>
  )
}

export default App

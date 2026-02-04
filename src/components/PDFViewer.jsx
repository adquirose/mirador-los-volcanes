import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configurar worker de PDF.js usando unpkg que tiene mejor disponibilidad CORS
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Detectar si es dispositivo móvil
  const isMobile = window.innerWidth <= 768;

  // Configurar escala inicial basada en dispositivo
  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth <= 480) {
        setScale(0.9);
      } else if (window.innerWidth <= 768) {
        setScale(1.0);
      } else {
        setScale(1.2);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const resetZoom = () => {
    if (window.innerWidth <= 480) {
      setScale(0.9);
    } else if (window.innerWidth <= 768) {
      setScale(1.0);
    } else {
      setScale(1.2);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Escuchar cambios de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controles táctiles para móvil
  const handleTouchStart = useRef(null);
  const handleTouchEnd = (e) => {
    if (!handleTouchStart.current) return;
    
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - handleTouchStart.current.clientX;
    
    // Deslizar hacia la izquierda = página siguiente
    if (deltaX < -50) {
      goToNextPage();
    }
    // Deslizar hacia la derecha = página anterior  
    else if (deltaX > 50) {
      goToPrevPage();
    }
    
    handleTouchStart.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className={`pdf-viewer ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Barra de herramientas */}
      <div className="toolbar">
        <div className="nav-controls">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
            ◀
          </button>
          <span className="page-info">
            {pageNumber} de {numPages || 0}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            ▶
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={zoomOut}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn}>+</button>
          <button onClick={resetZoom}>Restablecer</button>
        </div>

        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      </div>

      {/* Contenedor del PDF */}
      <div 
        className="pdf-container"
        onTouchStart={(e) => {
          handleTouchStart.current = e.touches[0];
        }}
        onTouchEnd={handleTouchEnd}
      >
        {loading && <div className="loading">Cargando PDF...</div>}
        
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading=""
          error="Error al cargar el PDF"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading=""
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
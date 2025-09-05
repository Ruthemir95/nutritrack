import React, { useState } from 'react';

interface CsvDebugViewerProps {
  file: File | null;
  onFileContent: (content: string) => void;
}

const CsvDebugViewer: React.FC<CsvDebugViewerProps> = ({ file, onFileContent }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const readFileContent = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const text = await file.text();
      setContent(text);
      onFileContent(text);
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!file) return null;

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h4 style={{ margin: 0, color: '#374151' }}>🔍 Debug File CSV</h4>
        <button
          onClick={readFileContent}
          disabled={isLoading}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳ Caricamento...' : '📖 Leggi Contenuto'}
        </button>
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
          <strong>Nome file:</strong> {file.name}
        </p>
        <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
          <strong>Dimensione:</strong> {(file.size / 1024).toFixed(2)} KB
        </p>
        <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
          <strong>Tipo:</strong> {file.type || 'Non specificato'}
        </p>
      </div>

      {content && (
        <div style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          maxHeight: '200px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {content}
        </div>
      )}
    </div>
  );
};

export default CsvDebugViewer;

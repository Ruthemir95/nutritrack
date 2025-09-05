import React from 'react';

interface CsvTemplateDownloaderProps {
  onDownload: () => void;
}

const CsvTemplateDownloader: React.FC<CsvTemplateDownloaderProps> = ({ onDownload }) => {
  const handleDownload = () => {
    // Dati di esempio per il template CSV semplificato
    const templateData = [
      {
        nome_alimento: 'Petto di pollo',
        peso_grammi: 200
      },
      {
        nome_alimento: 'Riso integrale',
        peso_grammi: 150
      },
      {
        nome_alimento: 'Salmone',
        peso_grammi: 180
      },
      {
        nome_alimento: 'Broccoli',
        peso_grammi: 100
      },
      {
        nome_alimento: 'Avocado',
        peso_grammi: 120
      },
      {
        nome_alimento: 'Pasta integrale',
        peso_grammi: 80
      },
      {
        nome_alimento: 'Uova',
        peso_grammi: 100
      }
    ];

    // Converti in CSV
    const csvContent = [
      'nome_alimento,peso_grammi',
      ...templateData.map(row => 
        `${row.nome_alimento},${row.peso_grammi}`
      )
    ].join('\n');

    // Crea e scarica il file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'nutritrack_alimenti_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onDownload();
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '1.5rem',
          marginRight: '0.75rem'
        }}>📥</div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          Template Alimenti Semplificato
        </h3>
      </div>
      
      <p style={{
        color: '#6b7280',
        marginBottom: '1rem',
        lineHeight: '1.5'
      }}>
        Scarica il template CSV semplificato per aggiungere alimenti. 
        I valori nutrizionali verranno recuperati automaticamente tramite API!
      </p>
      
      <div style={{
        backgroundColor: '#f1f5f9',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#475569'
      }}>
        <strong>Struttura del file (solo 2 colonne):</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li><code>nome_alimento</code> - Nome dell'alimento (es. "Petto di pollo")</li>
          <li><code>peso_grammi</code> - Peso in grammi (es. 200)</li>
        </ul>
        <br />
        <strong>✨ I valori nutrizionali verranno recuperati automaticamente!</strong>
      </div>
      
      <button
        onClick={handleDownload}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6';
        }}
      >
        <span>📥</span>
        Scarica Template CSV
      </button>
    </div>
  );
};

export default CsvTemplateDownloader;

import React from 'react';
import { mockNutritionDatabase } from '../services/nutritionApi';

interface SimpleFoodTemplateDownloaderProps {
  onDownload: () => void;
}

const SimpleFoodTemplateDownloader: React.FC<SimpleFoodTemplateDownloaderProps> = ({ onDownload }) => {
  const handleDownload = () => {
    // Lista semplificata di alimenti base
    const templateData = [
      { foodName: 'Yogurt greco' },
      { foodName: 'Petto di pollo' },
      { foodName: 'Salmone' },
      { foodName: 'Avena' },
      { foodName: 'Riso integrale' },
      { foodName: 'Uova' },
      { foodName: 'Mela' },
      { foodName: 'Pane integrale' },
      { foodName: 'Tonno' },
      { foodName: 'Quinoa' },
      { foodName: 'Banana' },
      { foodName: 'Spinaci' },
      { foodName: 'Pomodori' },
      { foodName: 'Avocado' },
      { foodName: 'Mandorle' }
    ];

    // Converti in CSV
    const csvContent = [
      'foodName',
      ...templateData.map(row => row.foodName)
    ].join('\n');

    // Crea e scarica il file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'nutritrack_alimenti_semplici.csv');
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
        }}>📝</div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          Template Alimenti Semplice
        </h3>
      </div>
      
      <p style={{
        color: '#6b7280',
        marginBottom: '1rem',
        lineHeight: '1.5'
      }}>
        Scarica il template CSV con una lista di alimenti base. 
        Modifica la lista aggiungendo/rimuovendo alimenti, poi ricarica per creare il tuo piano settimanale.
      </p>
      
      <div style={{
        backgroundColor: '#f1f5f9',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#475569'
      }}>
        <strong>Formato del file:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li><code>foodName</code> - Nome dell'alimento (una sola colonna)</li>
          <li>Usa nomi di alimenti esistenti nel database</li>
          <li>Un alimento per riga</li>
          <li>L'app calcolerà automaticamente le quantità</li>
        </ul>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#92400e'
      }}>
        <strong>💡 Come funziona:</strong>
        <ol style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li>Scarica il template con alimenti base</li>
          <li>Modifica la lista con i tuoi alimenti preferiti</li>
          <li>Ricarica il file nell'app</li>
          <li>Distribuisci gli alimenti nei pasti della settimana</li>
          <li>L'app crea automaticamente i pasti con quantità standard</li>
        </ol>
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
        Scarica Template Alimenti
      </button>
    </div>
  );
};

export default SimpleFoodTemplateDownloader;

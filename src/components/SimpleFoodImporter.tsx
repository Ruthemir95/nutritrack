import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import SimpleFoodTemplateDownloader from './SimpleFoodTemplateDownloader';
import WeeklyMealPlanner from './WeeklyMealPlanner';

interface CsvRow {
  [key: string]: string;
}

const SimpleFoodImporter: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [foods, setFoods] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseCsvFile(selectedFile);
    }
  };

  const parseCsvFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      encoding: 'UTF-8',
      quoteChar: '"',
      escapeChar: '"',
      trimHeaders: true,
      complete: (results) => {
        console.log('CSV Parsing Results:', results);
        
        if (results.errors.length > 0) {
          console.log('CSV Errors:', results.errors);
          const criticalErrors = results.errors.filter(error => 
            error.type !== 'Delimiter' && error.type !== 'Quotes' && error.type !== 'FieldMismatch'
          );
          
          if (criticalErrors.length > 0) {
            setError(`Errore nel parsing CSV: ${criticalErrors[0].message}`);
            return;
          }
        }
        
        const data = results.data as CsvRow[];
        console.log('Parsed Data:', data);
        
        if (data.length === 0) {
          setError('Il file CSV è vuoto o non contiene dati validi');
          return;
        }

        // Estrai i nomi degli alimenti
        const foodNames = data
          .map(row => row.foodName?.trim())
          .filter(name => name && name.length > 0);

        if (foodNames.length === 0) {
          setError('Nessun alimento valido trovato nel file. Verifica che la colonna si chiami "foodName"');
          return;
        }

        setFoods(foodNames);
        setError(null);
        setShowPlanner(true);
      },
      error: (error) => {
        setError(`Errore nel parsing del file: ${error.message}`);
      }
    });
  };

  const resetImport = () => {
    setFile(null);
    setFoods([]);
    setError(null);
    setShowPlanner(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMealsCreated = (count: number) => {
    alert(`✅ Creati ${count} pasti con successo!`);
    resetImport();
  };

  if (showPlanner) {
    return (
      <div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              ✅ Alimenti Caricati ({foods.length})
            </h3>
            <button
              onClick={resetImport}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              🔄 Nuovo Import
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {foods.map((food, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {food}
              </span>
            ))}
          </div>
        </div>

        <WeeklyMealPlanner 
          selectedFoods={foods}
          onMealsCreated={handleMealsCreated}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '2rem' }}>
        📝 Import Alimenti Semplice
      </h2>

      <div style={{
        backgroundColor: '#f0f9ff',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        border: '1px solid #bae6fd'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>
          💡 Come Funziona:
        </h3>
        <ol style={{ color: '#0369a1', marginLeft: '1.5rem', fontSize: '0.875rem' }}>
          <li>Scarica il template con alimenti base</li>
          <li>Modifica la lista con i tuoi alimenti preferiti</li>
          <li>Ricarica il file nell'app</li>
          <li>Distribuisci gli alimenti nei pasti della settimana</li>
          <li>L'app crea automaticamente i pasti con quantità standard</li>
        </ol>
      </div>

      {/* Template Downloader */}
      <SimpleFoodTemplateDownloader onDownload={() => {
        console.log('Template alimenti semplice scaricato!');
      }} />

      {/* Upload File */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          📁 Carica File CSV
        </h3>
        
        <div style={{
          border: '2px dashed #d1d5db',
          borderRadius: '0.5rem',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          marginBottom: '1rem'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            {file ? `File selezionato: ${file.name}` : 'Clicca per selezionare un file CSV'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Seleziona File
          </button>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Formato supportato: CSV con una sola colonna "foodName"
        </p>
      </div>

      {/* Errori */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SimpleFoodImporter;

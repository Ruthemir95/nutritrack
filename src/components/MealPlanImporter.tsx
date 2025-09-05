import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useAppDispatch } from '../app/hooks';
import { createMeal } from '../features/meals/mealsSlice';
import type { Meal, MealItem } from '../types';
import MealPlanTemplateDownloader from './MealPlanTemplateDownloader';
import { searchFoodByName, calculateNutritionForGrams } from '../services/nutritionApi';

interface CsvRow {
  [key: string]: string;
}

interface ParsedMeal {
  date: string;
  mealType: string;
  foodName: string;
  grams: number;
  notes?: string;
  nutritionData?: {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sodium: number;
    potassium: number;
    calcium: number;
    iron: number;
    vitaminC: number;
    vitaminD: number;
  };
  foodFound?: boolean;
}

const MealPlanImporter: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [previewData, setPreviewData] = useState<ParsedMeal[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Colonne richieste per l'import
  const requiredColumns = ['date', 'mealType', 'foodName', 'grams'];

  // Tipi di pasto validi
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setImportResults(null);
      parseCsvFile(selectedFile);
    }
  };

  const parseCsvFile = (file: File) => {
    // Prova prima con virgola, poi con punto e virgola
    const tryParse = (delimiter: string) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: delimiter,
        encoding: 'UTF-8',
        complete: async (results) => {
          console.log(`CSV Parsing Results (delimiter: ${delimiter}):`, results);
          
          if (results.errors.length > 0) {
            console.log('CSV Errors:', results.errors);
            // Filtra errori non critici
            const criticalErrors = results.errors.filter(error => 
              error.type !== 'Delimiter' && error.type !== 'Quotes'
            );
            
            if (criticalErrors.length > 0) {
              // Se ci sono errori critici, prova con altro delimitatore
              if (delimiter === ',' && criticalErrors.some(e => e.type === 'Delimiter')) {
                console.log('Trying with semicolon delimiter...');
                tryParse(';');
                return;
              }
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

          // Controlla se è un file di alimenti invece che piano alimentare
          const firstRow = data[0];
          const hasFoodColumns = firstRow.hasOwnProperty('name') && firstRow.hasOwnProperty('category') && firstRow.hasOwnProperty('kcal');
          if (hasFoodColumns) {
            setError(`❌ File sbagliato! Questo è un file di alimenti database (${Object.keys(firstRow).length} colonne). Per importare il piano alimentare, usa il template con 5 colonne (date, mealType, foodName, grams, notes). Vai su "🍎 Import Alimenti Database" per usare questo file.`);
            return;
          }
          
          setParsedData(data);
          
          // Valida e converte i dati (ora asincrono)
          const validatedData = await validateAndConvertData(data);
          setPreviewData(validatedData.valid);
          
          if (validatedData.errors.length > 0) {
            setError(`Trovati ${validatedData.errors.length} errori/warning nei dati. Controlla la preview.`);
          } else {
            // Clear any previous errors if parsing was successful
            setError(null);
          }
        },
        error: (error) => {
          // Se fallisce con virgola, prova con punto e virgola
          if (delimiter === ',') {
            console.log('Comma failed, trying semicolon...');
            tryParse(';');
          } else {
            setError(`Errore nel parsing del file: ${error.message}`);
          }
        }
      });
    };
    
    // Inizia con virgola
    tryParse(',');
  };

  const validateAndConvertData = async (data: CsvRow[]) => {
    const valid: ParsedMeal[] = [];
    const errors: string[] = [];

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      const rowErrors: string[] = [];

      // Verifica colonne obbligatorie
      requiredColumns.forEach(col => {
        if (!row[col] || row[col].trim() === '') {
          rowErrors.push(`Colonna '${col}' mancante o vuota`);
        }
      });

      if (rowErrors.length > 0) {
        errors.push(`Riga ${index + 2}: ${rowErrors.join(', ')}`);
        continue;
      }

      // Valida data
      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        rowErrors.push(`Data non valida: ${row.date}`);
      }

      // Valida tipo pasto
      if (!validMealTypes.includes(row.mealType.toLowerCase())) {
        rowErrors.push(`Tipo pasto non valido: ${row.mealType}. Valori accettati: ${validMealTypes.join(', ')}`);
      }

      // Valida grammi
      const grams = parseFloat(row.grams);
      if (isNaN(grams) || grams <= 0) {
        rowErrors.push(`Quantità non valida: ${row.grams}. Deve essere un numero positivo`);
      }

      if (rowErrors.length > 0) {
        errors.push(`Riga ${index + 2}: ${rowErrors.join(', ')}`);
        continue;
      }

      // Cerca dati nutrizionali
      const nutritionData = await searchFoodByName(row.foodName.trim());
      let calculatedNutrition = null;
      let foodFound = false;

      if (nutritionData) {
        calculatedNutrition = calculateNutritionForGrams(nutritionData, grams);
        foodFound = true;
      } else {
        // Se non trova l'alimento, aggiungi un warning
        errors.push(`Riga ${index + 2}: Alimento '${row.foodName}' non trovato nel database nutrizionale`);
      }

      valid.push({
        date: row.date,
        mealType: row.mealType.toLowerCase(),
        foodName: row.foodName.trim(),
        grams: grams,
        notes: row.notes?.trim() || '',
        nutritionData: calculatedNutrition || undefined,
        foodFound
      });
    }

    return { valid, errors };
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      setError('Nessun dato valido da importare');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Raggruppa i pasti per data e tipo
      const mealsMap = new Map<string, ParsedMeal[]>();
      
      previewData.forEach(meal => {
        const key = `${meal.date}-${meal.mealType}`;
        if (!mealsMap.has(key)) {
          mealsMap.set(key, []);
        }
        mealsMap.get(key)!.push(meal);
      });

      let successCount = 0;
      const errors: string[] = [];

      // Crea i pasti
      for (const [key, meals] of mealsMap) {
        try {
          const [date, mealType] = key.split('-');
          
          // Crea gli item del pasto
          const mealItems: MealItem[] = meals.map(meal => ({
            foodId: '', // Sarà popolato quando l'alimento viene trovato
            foodName: meal.foodName,
            grams: meal.grams,
            notes: meal.notes
          }));

          const newMeal: Omit<Meal, 'id'> = {
            userId: '1', // Per ora hardcoded, in futuro dal context auth
            date: date,
            type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
            items: mealItems,
            completed: false,
            notes: meals[0].notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await dispatch(createMeal(newMeal)).unwrap();
          successCount++;
        } catch (error) {
          errors.push(`Errore nel creare il pasto ${key}: ${error}`);
        }
      }

      setImportResults({
        success: successCount,
        errors,
        total: mealsMap.size
      });

    } catch (error) {
      setError(`Errore durante l'import: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setParsedData([]);
    setPreviewData([]);
    setError(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '2rem' }}>
        📅 Import Piano Alimentare Personale
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
        <ul style={{ color: '#0369a1', marginLeft: '1.5rem', fontSize: '0.875rem' }}>
          <li>Scarica il template con alimenti dal database</li>
          <li>Modifica date, quantità e note</li>
          <li>L'app calcola automaticamente i valori nutrizionali</li>
          <li>I pasti vengono creati nel tuo piano personale</li>
        </ul>
      </div>

      {/* Template CSV Downloader */}
      <MealPlanTemplateDownloader onDownload={() => {
        console.log('Template piano alimentare scaricato!');
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

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {file && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleImport}
              disabled={isProcessing || previewData.length === 0}
              style={{
                backgroundColor: previewData.length === 0 ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: previewData.length === 0 ? 'not-allowed' : 'pointer',
                opacity: previewData.length === 0 ? 0.6 : 1
              }}
            >
              {isProcessing ? '⏳ Importando...' : `📥 Importa ${previewData.length} pasti`}
            </button>
            
            <button
              onClick={resetImport}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              🔄 Reset
            </button>
          </div>
        )}
      </div>

      {/* Preview Data */}
      {previewData.length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            👀 Anteprima Dati
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Data</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Tipo</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Alimento</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Grammi</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Calorie</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Proteine</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((meal, index) => (
                  <tr key={index} style={{ 
                    backgroundColor: meal.foodFound ? '#f0fdf4' : '#fef2f2' 
                  }}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{meal.date}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{meal.mealType}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{meal.foodName}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{meal.grams}g</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                      {meal.nutritionData ? `${meal.nutritionData.kcal} kcal` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                      {meal.nutritionData ? `${meal.nutritionData.protein}g` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                      {meal.foodFound ? (
                        <span style={{ color: '#10b981', fontWeight: '500' }}>✅ Trovato</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: '500' }}>❌ Non trovato</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{meal.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {previewData.length > 10 && (
              <p style={{ color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
                ... e altri {previewData.length - 10} elementi
              </p>
            )}
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            📊 Risultati Import
          </h3>
          
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#0369a1', margin: 0 }}>
              ✅ <strong>{importResults.success}</strong> pasti importati con successo su {importResults.total} totali
            </p>
          </div>

          {importResults.errors.length > 0 && (
            <div style={{
              backgroundColor: '#fef2f2',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>❌ Errori:</h4>
              <ul style={{ color: '#dc2626', marginLeft: '1.5rem' }}>
                {importResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlanImporter;

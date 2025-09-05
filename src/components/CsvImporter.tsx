import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useAppDispatch } from '../app/hooks';
import { createFood } from '../features/foods/foodsSlice';
import { searchFoodByName, createFallbackFood, calculateNutritionForGrams } from '../services/openFoodFactsApi';
import { getApiSetupMessage } from '../config/api';
import type { Food } from '../types';
import CsvTemplateDownloader from './CsvTemplateDownloader';
import CsvDebugViewer from './CsvDebugViewer';

interface CsvRow {
  [key: string]: string;
}

interface ParsedFood {
  name: string;
  brand?: string;
  category: string;
  barcode?: string;
  per100g: {
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
  tags: string[];
  grams: number;
  calculatedNutrition?: {
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
}

type ColumnMapping = Record<string, string>;

const CsvImporter: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [previewData, setPreviewData] = useState<ParsedFood[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Colonne richieste per l'import semplificato
  const requiredColumns = ['nome_alimento', 'peso_grammi'];
  
  // Stato per il setup API
  const [apiSetup, setApiSetup] = useState(getApiSetupMessage());

  // Gestione upload file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'text/csv' && !uploadedFile.name.endsWith('.csv')) {
      setError('Per favore seleziona un file CSV valido');
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setImportResults(null);
    setPreviewData([]);
    
    // Parsing automatico del CSV con fallback per diversi delimitatori
    const tryParseWithDelimiter = (delimiter: string) => {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        delimiter: delimiter,
        encoding: 'UTF-8',
        quoteChar: '"',
        escapeChar: '"',
        trimHeaders: true,
        complete: (results) => {
          console.log(`CSV Parsing Results (delimiter: ${delimiter}):`, results);
          
          if (results.errors.length > 0) {
            console.log('CSV Errors:', results.errors);
            // Filtra errori non critici
            const criticalErrors = results.errors.filter(error => 
              error.type !== 'Delimiter' && error.type !== 'Quotes' && error.type !== 'FieldMismatch'
            );
            
            if (criticalErrors.length > 0) {
              // Se ci sono errori critici, prova con altro delimitatore
              if (delimiter === ',' && criticalErrors.some(e => e.type === 'FieldMismatch')) {
                console.log('Trying with semicolon delimiter...');
                tryParseWithDelimiter(';');
                return;
              }
              setError(`Errore nel parsing CSV: ${criticalErrors[0].message}`);
              return;
            }
          }
          
          const data = results.data as CsvRow[];
          console.log('Parsed Data:', data);
          console.log('Parsed Data length:', data.length);
          console.log('First few rows:', data.slice(0, 3));
          
          if (data.length === 0) {
            setError('Il file CSV è vuoto o non contiene dati validi');
            return;
          }

          // Controlla se è il formato corretto per alimenti
          const firstRow = data[0];
          console.log('First row details:', firstRow);
          console.log('First row keys:', Object.keys(firstRow));
          console.log('First row values:', Object.values(firstRow));
          const hasCorrectColumns = firstRow.hasOwnProperty('nome_alimento') && firstRow.hasOwnProperty('peso_grammi');
          if (!hasCorrectColumns) {
            setError(`❌ Formato file sbagliato! Il file deve avere solo 2 colonne: "nome_alimento" e "peso_grammi". Scarica il template corretto.`);
            return;
          }

          setParsedData(data);
          autoMapColumns(firstRow, data);
          setError(null); // Clear any previous errors
        },
        error: (error) => {
          console.log('Parse error:', error);
          // Se fallisce con virgola, prova con punto e virgola
          if (delimiter === ',') {
            console.log('Comma failed, trying semicolon...');
            tryParseWithDelimiter(';');
          } else {
            setError(`Errore nel parsing del file: ${error.message}`);
          }
        }
      });
    };
    
    // Inizia con virgola
    tryParseWithDelimiter(',');
  };

  // Mapping automatico delle colonne
  const autoMapColumns = (firstRow: CsvRow, data: CsvRow[]) => {
    const mapping: Record<string, string> = {};
    const availableColumns = Object.keys(firstRow);
    
    console.log('🔍 Available columns:', availableColumns);
    console.log('🔍 First row data:', firstRow);
    
    // Mapping intelligente basato su nomi colonne
    const columnMappings = {
      nome_alimento: ['nome', 'name', 'alimento', 'food', 'descrizione', 'description', 'nome_alimento'],
      peso_grammi: ['peso', 'weight', 'grammi', 'grams', 'g', 'peso_grammi'],
      name: ['nome', 'name', 'alimento', 'food', 'descrizione', 'description'],
      brand: ['marca', 'brand', 'produttore', 'manufacturer'],
      category: ['categoria', 'category', 'tipo', 'type'],
      barcode: ['barcode', 'codice', 'code', 'ean'],
      kcal: ['calorie', 'kcal', 'energy', 'energia'],
      protein: ['proteine', 'protein', 'proteina'],
      carbs: ['carboidrati', 'carbs', 'carbohydrates', 'carboidrato'],
      fats: ['grassi', 'fats', 'fat', 'lipidi'],
      fiber: ['fibra', 'fiber', 'fibre'],
      sodium: ['sodio', 'sodium', 'na'],
      potassium: ['potassio', 'potassium', 'k'],
      calcium: ['calcio', 'calcium', 'ca'],
      iron: ['ferro', 'iron', 'fe'],
      vitaminC: ['vitamina c', 'vitamin c', 'vitc', 'acido ascorbico'],
      vitaminD: ['vitamina d', 'vitamin d', 'vitd', 'calciferolo'],
      tags: ['tag', 'tags', 'etichette', 'labels']
    };

    availableColumns.forEach(column => {
      const columnLower = column.toLowerCase().trim();
      
      for (const [targetKey, possibleNames] of Object.entries(columnMappings)) {
        if (possibleNames.some(name => columnLower.includes(name))) {
          mapping[targetKey] = column;
          console.log(`✅ Mapped: ${column} -> ${targetKey}`);
          break;
        }
      }
    });

    console.log('🎯 Final mapping:', mapping);
    console.log('🎯 About to call mapDataToFood with data:', data.slice(0, 2));
    setColumnMapping(mapping);
    // Chiama mapDataToFood in modo asincrono con il mapping corretto e i dati passati direttamente
    mapDataToFood(data, mapping).catch(console.error);
  };

  // Preview dei dati mappati con API
  const mapDataToFood = async (data: CsvRow[], mapping: ColumnMapping) => {
    if (data.length === 0) return;

    console.log('mapDataToFood called with:', { data: data.length, mapping });
    console.log('🔍 Sample data row:', data[0]);
    console.log('🔍 Mapping keys:', Object.keys(mapping));
    setIsLoadingPreview(true);
    
    try {
      const preview: ParsedFood[] = [];
      const maxPreviewRows = Math.min(5, data.length);

      for (let i = 0; i < maxPreviewRows; i++) {
        const row = data[i];
        console.log(`🔍 Processing row ${i}:`, row);
        console.log(`🔍 Looking for nome_alimento in:`, mapping.nome_alimento);
        console.log(`🔍 Looking for peso_grammi in:`, mapping.peso_grammi);
        
        const foodName = row[mapping.nome_alimento]?.trim();
        const grams = parseFloat(row[mapping.peso_grammi]) || 0;

        console.log(`🔍 Extracted - foodName: "${foodName}", grams: ${grams}`);

        if (!foodName || grams <= 0) {
          console.log(`❌ Skipping row ${i} - invalid data`);
          continue;
        }

        try {
          // Cerca i dati nutrizionali tramite API
          console.log(`Searching for: ${foodName}`);
          const nutritionData = await searchFoodByName(foodName);
          console.log(`API result for ${foodName}:`, nutritionData);
          
          if (nutritionData) {
            const calculatedNutrition = calculateNutritionForGrams(nutritionData, grams);
            
            const mappedFood: ParsedFood = {
              name: nutritionData.name,
              brand: nutritionData.brand,
              category: nutritionData.category,
              barcode: nutritionData.barcode,
              per100g: nutritionData.per100g,
              tags: nutritionData.tags,
              grams: grams,
              calculatedNutrition: calculatedNutrition
            };

            preview.push(mappedFood);
          } else {
            // Fallback per alimenti non trovati
            const fallbackFood = createFallbackFood(foodName, grams);
            const calculatedNutrition = calculateNutritionForGrams(fallbackFood, grams);
            
            const mappedFood: ParsedFood = {
              name: fallbackFood.name,
              brand: fallbackFood.brand,
              category: fallbackFood.category,
              barcode: fallbackFood.barcode,
              per100g: fallbackFood.per100g,
              tags: fallbackFood.tags,
              grams: grams,
              calculatedNutrition: calculatedNutrition
            };

            preview.push(mappedFood);
          }
        } catch (apiError) {
          console.error(`Error processing ${foodName}:`, apiError);
          // Fallback per errori API
          const fallbackFood = createFallbackFood(foodName, grams);
          const calculatedNutrition = calculateNutritionForGrams(fallbackFood, grams);
          
          const mappedFood: ParsedFood = {
            name: fallbackFood.name,
            brand: fallbackFood.brand,
            category: fallbackFood.category,
            barcode: fallbackFood.barcode,
            per100g: fallbackFood.per100g,
            tags: fallbackFood.tags,
            grams: grams,
            calculatedNutrition: calculatedNutrition
          };

          preview.push(mappedFood);
        }
      }

      console.log('Preview data prepared:', preview);
      setPreviewData(preview);
    } catch (error) {
      console.error('Error in mapDataToFood:', error);
      setError('Errore nel recupero dei dati nutrizionali');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Validazione dei dati semplificata
  const validateData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Verifica colonne richieste
    const missingColumns = requiredColumns.filter(col => !columnMapping[col]);
    if (missingColumns.length > 0) {
      errors.push(`Colonne mancanti: ${missingColumns.join(', ')}`);
    }

    // Verifica dati di base
    parsedData.forEach((row, index) => {
      const rowNum = index + 2; // +2 perché CSV inizia da 1 e abbiamo header
      
      const foodName = row[columnMapping.nome_alimento]?.trim();
      const grams = parseFloat(row[columnMapping.peso_grammi]);

      if (!foodName) {
        errors.push(`Riga ${rowNum}: Nome alimento è obbligatorio`);
      }

      if (isNaN(grams) || grams <= 0) {
        errors.push(`Riga ${rowNum}: Peso deve essere un numero positivo`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  // Import dei dati
  const handleImport = async () => {
    const validation = validateData();
    if (!validation.isValid) {
      setError(`Errori di validazione:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const results = {
      success: 0,
      errors: [] as string[],
      total: parsedData.length
    };

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      try {
        const foodName = row[columnMapping.nome_alimento]?.trim();
        const grams = parseFloat(row[columnMapping.peso_grammi]);

        if (!foodName || grams <= 0) {
          results.errors.push(`Riga ${i + 2}: Dati non validi`);
          continue;
        }

        // Cerca i dati nutrizionali tramite API
        const nutritionData = await searchFoodByName(foodName);
        
        if (nutritionData) {
          const foodData: Omit<Food, 'id'> = {
            name: nutritionData.name,
            brand: nutritionData.brand,
            category: nutritionData.category,
            barcode: nutritionData.barcode,
            per100g: nutritionData.per100g,
            tags: nutritionData.tags
          };

          await dispatch(createFood(foodData)).unwrap();
          results.success++;
        } else {
          // Fallback per alimenti non trovati
          const fallbackFood = createFallbackFood(foodName, grams);
          const foodData: Omit<Food, 'id'> = {
            name: fallbackFood.name,
            brand: fallbackFood.brand,
            category: fallbackFood.category,
            barcode: fallbackFood.barcode,
            per100g: fallbackFood.per100g,
            tags: fallbackFood.tags
          };

          await dispatch(createFood(foodData)).unwrap();
          results.success++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Errore sconosciuto';
        results.errors.push(`Riga ${i + 2}: ${errorMsg}`);
      }
    }

    setImportResults(results);
    setIsProcessing(false);
    
    // Reset per nuovo import
    if (results.success > 0) {
      setFile(null);
      setParsedData([]);
      setPreviewData([]);
      setColumnMapping({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Reset completo
  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setPreviewData([]);
    setColumnMapping({});
    setImportResults(null);
    setError(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          🍎 Import Alimenti nel Database
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Carica un file CSV per aggiungere alimenti al database nutrizionale. Il file deve contenere tutti i valori nutrizionali per 100g.
        </p>

        {/* Upload File */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: '500', 
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Seleziona File CSV
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              padding: '0.75rem',
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              width: '100%',
              backgroundColor: '#f9fafb'
            }}
          />
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Formato supportato: CSV con header e valori separati da virgola
          </p>
        </div>

        {/* Debug Viewer */}
        <CsvDebugViewer 
          file={file} 
          onFileContent={(content) => {
            console.log('File content:', content);
          }}
        />

        {/* Test API Button */}
        {file && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>🧪 Test Open Food Facts API</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={async () => {
                  console.log('Testing Open Food Facts API with "pane"');
                  const result = await searchFoodByName('pane');
                  console.log('API Test Result:', result);
                  alert(`Open Food Facts API Test: ${result ? 'Success' : 'Failed'}`);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Test con "pane"
              </button>
              <button
                onClick={async () => {
                  console.log('Testing Open Food Facts API with "pollo"');
                  const result = await searchFoodByName('pollo');
                  console.log('API Test Result:', result);
                  alert(`Open Food Facts API Test: ${result ? 'Success' : 'Failed'}`);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Test con "pollo"
              </button>
            </div>
          </div>
        )}

        {/* Errori */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626',
            marginBottom: '1rem',
            whiteSpace: 'pre-line'
          }}>
            {error}
          </div>
        )}

        {/* Risultati Import */}
        {importResults && (
          <div style={{
            padding: '1rem',
            backgroundColor: importResults.success > 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${importResults.success > 0 ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: importResults.success > 0 ? '#059669' : '#dc2626',
              marginBottom: '0.5rem'
            }}>
              {importResults.success > 0 ? '✅ Import Completato' : '❌ Import Fallito'}
            </h3>
            <p style={{ color: '#374151', marginBottom: '0.5rem' }}>
              <strong>Risultati:</strong> {importResults.success} su {importResults.total} alimenti importati con successo
            </p>
            {importResults.errors.length > 0 && (
              <div>
                <p style={{ color: '#dc2626', fontWeight: '500', marginBottom: '0.5rem' }}>Errori:</p>
                <ul style={{ color: '#dc2626', marginLeft: '1.5rem' }}>
                  {importResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Setup API */}
        {apiSetup.needsSetup && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
              ⚠️ Configurazione API Richiesta
            </h3>
            <p style={{ color: '#92400e', marginBottom: '0.5rem' }}>
              {apiSetup.message}
            </p>
            <ul style={{ color: '#92400e', marginLeft: '1.5rem' }}>
              {apiSetup.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading Preview */}
        {isLoadingPreview && (
          <div style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '1rem', color: '#666' }}>
              🔍 Recupero dati nutrizionali tramite API...
            </p>
          </div>
        )}

        {/* Preview Dati */}
        {previewData.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              📊 Anteprima Alimenti
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              I valori nutrizionali verranno recuperati automaticamente tramite API
            </p>
            
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      Alimento
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      Peso (g)
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      Calorie/100g
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      Proteine/100g
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      Categoria
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((food, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>{food.name}</div>
                          {food.brand && (
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{food.brand}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                        {food.grams}g
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {food.per100g.kcal} kcal
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {food.per100g.protein}g
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {food.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          backgroundColor: food.per100g.kcal > 0 ? '#dcfce7' : '#fef3c7',
                          color: food.per100g.kcal > 0 ? '#166534' : '#92400e',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {food.per100g.kcal > 0 ? '✅ Trovato' : '⚠️ Da verificare'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottoni di Azione */}
        {previewData.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={handleImport}
              disabled={isProcessing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isProcessing ? '⏳' : '📥'} {isProcessing ? 'Importando...' : 'Importa Alimenti'}
            </button>
            
            <button
              onClick={handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Reset
            </button>
          </div>
        )}

      </div>

      {/* Template CSV Downloader */}
      <CsvTemplateDownloader onDownload={() => {
        console.log('Template CSV scaricato!');
      }} />
    </div>
  );
};

export default CsvImporter;

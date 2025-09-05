import React, { useState, useRef } from 'react';
import { searchFoodByBarcode } from '../services/openFoodFactsApi';
import type { Food } from '../types';

interface BarcodeScannerProps {
  onFoodFound: (food: Food) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onFoodFound, onClose }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<any>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setIsScanning(true);
    setError(null);
    setFoundProduct(null);

    try {
      console.log(`🔍 Scanning barcode: ${barcode}`);
      const result = await searchFoodByBarcode(barcode);
      
      if (result) {
        console.log('✅ Product found:', result);
        setFoundProduct(result);
      } else {
        setError('Prodotto non trovato nel database Open Food Facts');
      }
    } catch (err) {
      console.error('Barcode scan error:', err);
      setError('Errore durante la scansione del codice a barre');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddToDatabase = () => {
    if (!foundProduct) return;

    const foodData: Omit<Food, 'id'> = {
      name: foundProduct.name,
      brand: foundProduct.brand,
      category: foundProduct.category,
      barcode: foundProduct.barcode,
      per100g: foundProduct.per100g,
      tags: foundProduct.tags
    };

    onFoodFound(foodData);
    onClose();
  };

  const handleReset = () => {
    setBarcode('');
    setError(null);
    setFoundProduct(null);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            📱 Scanner Codice a Barre
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        {/* Istruzioni */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>
            Come usare lo scanner:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', fontSize: '0.875rem' }}>
            <li>Inserisci manualmente il codice a barre del prodotto</li>
            <li>Oppure usa la fotocamera del telefono per scansionare</li>
            <li>Il sistema cercherà il prodotto nel database Open Food Facts</li>
          </ul>
        </div>

        {/* Form di input */}
        <form onSubmit={handleBarcodeSubmit} style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Codice a Barre
            </label>
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Inserisci o scansiona il codice a barre"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                textAlign: 'center',
                letterSpacing: '0.1em'
              }}
              autoFocus
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              disabled={isScanning || !barcode.trim()}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: isScanning ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isScanning ? '⏳' : '🔍'} {isScanning ? 'Scansionando...' : 'Cerca Prodotto'}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Reset
            </button>
          </div>
        </form>

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

        {/* Risultato prodotto trovato */}
        {foundProduct && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#166534', marginBottom: '1rem' }}>
              ✅ Prodotto Trovato!
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                {foundProduct.name}
              </h4>
              {foundProduct.brand && (
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  <strong>Marca:</strong> {foundProduct.brand}
                </p>
              )}
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                <strong>Categoria:</strong> {foundProduct.category}
              </p>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                <strong>Codice:</strong> {foundProduct.barcode}
              </p>
            </div>

            {/* Valori nutrizionali per 100g */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Valori Nutrizionali (per 100g):
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <div style={{ color: '#ef4444', fontWeight: '600' }}>{foundProduct.per100g.kcal} kcal</div>
                  <div style={{ color: '#6b7280' }}>Calorie</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <div style={{ color: '#3b82f6', fontWeight: '600' }}>{foundProduct.per100g.protein}g</div>
                  <div style={{ color: '#6b7280' }}>Proteine</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <div style={{ color: '#f59e0b', fontWeight: '600' }}>{foundProduct.per100g.carbs}g</div>
                  <div style={{ color: '#6b7280' }}>Carboidrati</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <div style={{ color: '#10b981', fontWeight: '600' }}>{foundProduct.per100g.fats}g</div>
                  <div style={{ color: '#6b7280' }}>Grassi</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {foundProduct.tags && foundProduct.tags.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Tags:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {foundProduct.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#e5e7eb',
                        color: '#374151',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pulsanti azione */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleAddToDatabase}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                ✅ Aggiungi al Database
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                🔄 Nuova Ricerca
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1rem'
        }}>
          <p style={{ margin: 0 }}>
            Powered by <strong>Open Food Facts</strong> - Database gratuito e open source
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;

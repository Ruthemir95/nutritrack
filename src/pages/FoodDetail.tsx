import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchFoodById, clearCurrentFood } from '../features/foods/foodsSlice';

const FoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentFood, isLoading, error } = useAppSelector((state: any) => state.foods as any);

  useEffect(() => {
    if (id) {
      dispatch(fetchFoodById(id));
    }
    
    // Cleanup quando il componente si smonta
    return () => {
      dispatch(clearCurrentFood());
    };
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', color: '#666' }}>Caricamento alimento...</p>
      </div>
    );
  }

  if (error || !currentFood) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '1.5rem', marginBottom: '1rem' }}>
          ❌ Errore nel caricamento
        </div>
        <p style={{ color: '#666' }}>{error || 'Alimento non trovato'}</p>
        <button 
          onClick={() => navigate('/foods')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Torna alla Lista
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
            {currentFood.name}
          </h1>
          {currentFood.brand && (
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              {currentFood.brand}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate(`/foods/${id}/edit`)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ✏️ Modifica
          </button>
          
          <button
            onClick={() => navigate('/foods')}
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
            ← Torna alla Lista
          </button>
        </div>
      </div>

      {/* Informazioni base */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Informazioni Base
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#6b7280',
              marginBottom: '0.25rem'
            }}>
              Categoria
            </label>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {currentFood.category}
            </span>
          </div>
          
          {currentFood.barcode && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>
                Codice a Barre
              </label>
              <p style={{ fontSize: '1rem', color: '#374151' }}>{currentFood.barcode}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {currentFood.tags && currentFood.tags.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Tag
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {currentFood.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Valori nutrizionali per 100g */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Valori Nutrizionali per 100g
        </h2>
        
        {/* Macronutrienti */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Macronutrienti
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
                {currentFood.per100g.kcal}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>kcal</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
                {currentFood.per100g.protein}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Proteine</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                {currentFood.per100g.carbs}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Carboidrati</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                {currentFood.per100g.fats}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Grassi</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
                {currentFood.per100g.fiber}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Fibra</div>
            </div>
          </div>
        </div>

        {/* Micronutrienti */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Micronutrienti
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0369a1' }}>
                {currentFood.per100g.sodium}mg
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sodio</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                {currentFood.per100g.potassium}mg
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Potassio</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0369a1' }}>
                {currentFood.per100g.calcium}mg
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Calcio</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                {currentFood.per100g.iron}mg
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ferro</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                {currentFood.per100g.vitaminC}mg
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Vitamina C</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0369a1' }}>
                {currentFood.per100g.vitaminD}μg
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Vitamina D</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calcolo per porzioni comuni */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Calcolo per Porzioni Comuni
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>50g</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Porzione piccola</div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: '#059669' }}>
              {Math.round(currentFood.per100g.kcal * 0.5)} kcal
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>100g</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Porzione standard</div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: '#059669' }}>
              {currentFood.per100g.kcal} kcal
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>150g</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Porzione grande</div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: '#059669' }}>
              {Math.round(currentFood.per100g.kcal * 1.5)} kcal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createMeal, updateMeal, fetchMealsByDate, fetchMealById, setCurrentMeal } from '../features/meals/mealsSlice';
import { fetchFoods } from '../features/foods/foodsSlice';

interface MealFormData {
  type: string;
  date: string;
  notes: string;
  items: Array<{
    foodId: string;
    food: any;
    grams: number;
  }>;
}

const MealForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { foods, isLoading: foodsLoading } = useAppSelector(state => state.foods);
  const { currentMeal, isLoading: mealsLoading } = useAppSelector(state => state.meals);
  
  const [formData, setFormData] = useState<MealFormData>({
    type: location.state?.mealType || 'breakfast',
    date: location.state?.date || new Date().toISOString().split('T')[0],
    notes: '',
    items: []
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState<number>(100);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tipi di pasto disponibili
  const mealTypes = [
    { value: 'breakfast', label: '🌅 Colazione', icon: '🌅' },
    { value: 'lunch', label: '🌞 Pranzo', icon: '🌞' },
    { value: 'dinner', label: '🌙 Cena', icon: '🌙' },
    { value: 'snack', label: '🍎 Snack', icon: '🍎' }
  ];

  useEffect(() => {
    // Carica la lista degli alimenti
    dispatch(fetchFoods());
    
    // Se stiamo modificando un pasto esistente, carica i dati
    if (id) {
      dispatch(fetchMealById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Quando currentMeal cambia, aggiorna il form
    if (id && currentMeal) {
      setFormData({
        type: currentMeal.type,
        date: currentMeal.date,
        notes: currentMeal.notes || '',
        items: currentMeal.items.map(item => ({
          foodId: item.foodId,
          food: item.food,
          grams: item.grams
        }))
      });
    }
  }, [id, currentMeal]);

  // Filtra gli alimenti per la ricerca
  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcola i nutrienti totali del pasto
  const calculateTotalNutrients = () => {
    return formData.items.reduce((totals, item) => {
      const ratio = item.grams / 100;
      return {
        kcal: totals.kcal + (item.food.per100g.kcal * ratio),
        protein: totals.protein + (item.food.per100g.protein * ratio),
        carbs: totals.carbs + (item.food.per100g.carbs * ratio),
        fats: totals.fats + (item.food.per100g.fats * ratio),
        fiber: totals.fats + (item.food.per100g.fiber * ratio),
        sodium: totals.sodium + (item.food.per100g.sodium * ratio),
        potassium: totals.potassium + (item.food.per100g.potassium * ratio),
        calcium: totals.calcium + (item.food.per100g.calcium * ratio),
        iron: totals.iron + (item.food.per100g.iron * ratio),
        vitaminC: totals.vitaminC + (item.food.per100g.vitaminC * ratio),
        vitaminD: totals.vitaminD + (item.food.per100g.vitaminD * ratio),
      };
    }, {
      kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0,
      sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminC: 0, vitaminD: 0
    });
  };

  // Valida il form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Seleziona un tipo di pasto';
    }

    if (!formData.date) {
      newErrors.date = 'Seleziona una data';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Aggiungi almeno un alimento al pasto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Aggiunge un alimento al pasto
  const addFoodToMeal = () => {
    if (!selectedFood || grams <= 0) {
      setErrors({ grams: 'Seleziona un alimento e inserisci una quantità valida' });
      return;
    }

    // Verifica se l'alimento è già presente
    const existingItemIndex = formData.items.findIndex(item => item.foodId === selectedFood.id);
    
    if (existingItemIndex !== -1) {
      // Aggiorna la quantità se l'alimento è già presente
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].grams += grams;
      setFormData({ ...formData, items: updatedItems });
    } else {
      // Aggiunge un nuovo alimento
      const newItem = {
        foodId: selectedFood.id,
        food: selectedFood,
        grams: grams
      };
      setFormData({
        ...formData,
        items: [...formData.items, newItem]
      });
    }

    // Reset dei campi
    setSelectedFood(null);
    setGrams(100);
    setSearchTerm('');
    setErrors({});
  };

  // Rimuove un alimento dal pasto
  const removeFoodFromMeal = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  // Aggiorna la quantità di un alimento
  const updateFoodGrams = (index: number, newGrams: number) => {
    if (newGrams <= 0) return;
    
    const updatedItems = [...formData.items];
    updatedItems[index].grams = newGrams;
    setFormData({ ...formData, items: updatedItems });
  };

  // Gestisce il submit del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const mealData = {
        ...formData,
        userId: '1', // Per ora hardcoded, in futuro dall'auth
        completed: false
      };

      if (id) {
        // Aggiorna pasto esistente
        await dispatch(updateMeal({ id, mealData })).unwrap();
      } else {
        // Crea nuovo pasto
        await dispatch(createMeal(mealData)).unwrap();
      }

      // Aggiorna la lista dei pasti per la data selezionata
      await dispatch(fetchMealsByDate(formData.date));
      
      // Redirect alla lista pasti
      navigate('/meals');
    } catch (error) {
      console.error('Errore nel salvataggio del pasto:', error);
      setErrors({ submit: 'Errore nel salvataggio del pasto' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestisce la cancellazione
  const handleCancel = () => {
    navigate('/meals');
  };

  if (foodsLoading || mealsLoading) {
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
        <p style={{ marginTop: '1rem', color: '#666' }}>Caricamento...</p>
      </div>
    );
  }

  const totalNutrients = calculateTotalNutrients();
  const isEditMode = !!id;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
          {isEditMode ? 'Modifica Pasto' : 'Nuovo Pasto'}
        </h1>
        <p style={{ color: '#6b7280' }}>
          {isEditMode ? 'Modifica i dettagli del pasto' : 'Crea un nuovo pasto selezionando alimenti e quantità'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
        
        {/* Informazioni base del pasto */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            Informazioni Pasto
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Tipo Pasto *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.type ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                {mealTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.type}</p>
              )}
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.date ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              {errors.date && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.date}</p>
              )}
            </div>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Note (opzionale)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Aggiungi note al pasto..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Selezione alimenti */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            Aggiungi Alimenti
          </h2>
          
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Cerca Alimento
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, marca o categoria..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Grammi
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(Number(e.target.value))}
                  min="1"
                  step="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.grams ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <button
                type="button"
                onClick={addFoodToMeal}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                + Aggiungi
              </button>
            </div>
            
            {errors.grams && (
              <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.grams}</p>
            )}

            {/* Risultati ricerca alimenti */}
            {searchTerm && filteredFoods.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Risultati ricerca:
                </h4>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {filteredFoods.slice(0, 5).map((food) => (
                    <div
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: selectedFood?.id === food.id ? '#dbeafe' : 'white',
                        border: selectedFood?.id === food.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFood?.id !== food.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFood?.id !== food.id) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                            {food.name}
                          </p>
                          {food.brand && (
                            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {food.brand} • {food.category}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#059669' }}>
                            {food.per100g.kcal} kcal
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            P: {food.per100g.protein}g • C: {food.per100g.carbs}g • G: {food.per100g.fats}g
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredFoods.length > 5 && (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                    Mostrando i primi 5 risultati. Continua a digitare per filtrare meglio.
                  </p>
                )}
              </div>
            )}

            {searchTerm && filteredFoods.length === 0 && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: '#fef3c7', 
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
                  Nessun alimento trovato per "{searchTerm}". Prova con termini diversi.
                </p>
              </div>
            )}
          </div>

          {/* Lista alimenti selezionati */}
          {formData.items.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                Alimenti nel Pasto ({formData.items.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {formData.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>
                        {item.food.name}
                      </p>
                      {item.food.brand && (
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {item.food.brand} • {item.food.category}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        value={item.grams}
                        onChange={(e) => updateFoodGrams(index, Number(e.target.value))}
                        min="1"
                        step="1"
                        style={{
                          width: '80px',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>g</span>
                      
                      <button
                        type="button"
                        onClick={() => removeFoodFromMeal(index)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.items && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.items}</p>
          )}
        </div>

        {/* Riepilogo nutrizionale */}
        {formData.items.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Riepilogo Nutrizionale
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '1rem',
              backgroundColor: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                  {Math.round(totalNutrients.kcal)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>kcal</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                  {Math.round(totalNutrients.protein)}g
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Proteine</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                  {Math.round(totalNutrients.carbs)}g
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Carboidrati</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                  {Math.round(totalNutrients.fats)}g
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Grassi</div>
              </div>
            </div>
          </div>
        )}

        {/* Errori di submit */}
        {errors.submit && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {errors.submit}
          </div>
        )}

        {/* Azioni */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1.5rem'
        }}>
          <button
            type="button"
            onClick={handleCancel}
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
            Annulla
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {isSubmitting ? 'Salvataggio...' : (isEditMode ? 'Aggiorna Pasto' : 'Crea Pasto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createFood, updateFood, fetchFoodById } from '../features/foods/foodsSlice';

interface FoodFormData {
  name: string;
  brand: string;
  category: string;
  barcode: string;
  tags: string[];
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
}

interface FoodFormProps {
  food?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

const FoodForm: React.FC<FoodFormProps> = ({ food, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  
  const { currentFood, isLoading } = useAppSelector(state => state.foods);
  
  const [formData, setFormData] = useState<FoodFormData>({
    name: '',
    brand: '',
    category: '',
    barcode: '',
    tags: [],
    per100g: {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sodium: 0,
      potassium: 0,
      calcium: 0,
      iron: 0,
      vitaminC: 0,
      vitaminD: 0
    }
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categorie disponibili
  const categories = [
    'Proteine', 'Carboidrati', 'Grassi', 'Verdure', 'Frutta', 'Pesce', 
    'Carne', 'Latticini', 'Cereali', 'Legumi', 'Frutta secca', 'Altro'
  ];

  // Tag comuni
  const commonTags = [
    'bio', 'low-carb', 'high-protein', 'gluten-free', 'lactose-free',
    'vegan', 'vegetarian', 'omega3', 'antiossidanti', 'fibra'
  ];

  useEffect(() => {
    // Se stiamo modificando un alimento esistente, carica i dati
    if (id) {
      dispatch(fetchFoodById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Quando currentFood cambia, aggiorna il form
    if (id && currentFood) {
      setFormData({
        name: currentFood.name,
        brand: currentFood.brand || '',
        category: currentFood.category,
        barcode: currentFood.barcode || '',
        tags: currentFood.tags || [],
        per100g: { ...currentFood.per100g }
      });
    }
  }, [id, currentFood]);

  // Inizializza il form con i dati del food passato come prop (per le modali)
  useEffect(() => {
    if (food && !id) {
      setFormData({
        name: food.name || '',
        brand: food.brand || '',
        category: food.category || '',
        barcode: food.barcode || '',
        tags: food.tags || [],
        per100g: { ...food.per100g }
      });
    }
  }, [food, id]);

  // Valida il form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validazione campi obbligatori
    if (!formData.name.trim()) {
      newErrors.name = 'Il nome dell\'alimento è obbligatorio';
    }

    if (!formData.category) {
      newErrors.category = 'Seleziona una categoria';
    }

    // Validazione valori nutrizionali
    if (formData.per100g.kcal < 0) {
      newErrors.kcal = 'Le calorie non possono essere negative';
    }

    if (formData.per100g.protein < 0) {
      newErrors.protein = 'Le proteine non possono essere negative';
    }

    if (formData.per100g.carbs < 0) {
      newErrors.carbs = 'I carboidrati non possono essere negativi';
    }

    if (formData.per100g.fats < 0) {
      newErrors.fats = 'I grassi non possono essere negativi';
    }

    if (formData.per100g.fiber < 0) {
      newErrors.fiber = 'La fibra non può essere negativa';
    }

    // Validazione logica: proteine + carboidrati + grassi non possono superare 100g
    const totalMacros = formData.per100g.protein + formData.per100g.carbs + formData.per100g.fats;
    if (totalMacros > 100) {
      newErrors.macros = 'La somma di proteine, carboidrati e grassi non può superare 100g per 100g di alimento';
    }

    // Validazione micronutrienti
    if (formData.per100g.sodium < 0) newErrors.sodium = 'Il sodio non può essere negativo';
    if (formData.per100g.potassium < 0) newErrors.potassium = 'Il potassio non può essere negativo';
    if (formData.per100g.calcium < 0) newErrors.calcium = 'Il calcio non può essere negativo';
    if (formData.per100g.iron < 0) newErrors.iron = 'Il ferro non può essere negativo';
    if (formData.per100g.vitaminC < 0) newErrors.vitaminC = 'La vitamina C non può essere negativa';
    if (formData.per100g.vitaminD < 0) newErrors.vitaminD = 'La vitamina D non può essere negativa';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Aggiunge un tag
  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !formData.tags.includes(cleanTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, cleanTag]
      });
    }
    setTagInput('');
  };

  // Rimuove un tag
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Gestisce il submit del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const foodData = {
        ...formData,
        // Assicurati che i valori numerici siano numeri
        per100g: {
          kcal: Number(formData.per100g.kcal),
          protein: Number(formData.per100g.protein),
          carbs: Number(formData.per100g.carbs),
          fats: Number(formData.per100g.fats),
          fiber: Number(formData.per100g.fiber),
          sodium: Number(formData.per100g.sodium),
          potassium: Number(formData.per100g.potassium),
          calcium: Number(formData.per100g.calcium),
          iron: Number(formData.per100g.iron),
          vitaminC: Number(formData.per100g.vitaminC),
          vitaminD: Number(formData.per100g.vitaminD)
        }
      };

      if (id) {
        // Aggiorna alimento esistente (da URL)
        await dispatch(updateFood({ id, foodData })).unwrap();
      } else if (food && food.id) {
        // Aggiorna alimento esistente (da prop)
        await dispatch(updateFood({ id: food.id, foodData })).unwrap();
      } else {
        // Crea nuovo alimento
        await dispatch(createFood(foodData)).unwrap();
      }
      
      // Gestisci successo
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/foods');
      }
    } catch (error) {
      console.error('Errore nel salvataggio dell\'alimento:', error);
      setErrors({ submit: 'Errore nel salvataggio dell\'alimento' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestisce la cancellazione
  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/foods');
    }
  };

  // Calcola le calorie totali dai macronutrienti
  const calculateCalories = () => {
    const proteinCalories = formData.per100g.protein * 4;
    const carbCalories = formData.per100g.carbs * 4;
    const fatCalories = formData.per100g.fats * 9;
    return proteinCalories + carbCalories + fatCalories;
  };

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
        <p style={{ marginTop: '1rem', color: '#666' }}>Caricamento...</p>
      </div>
    );
  }

  const isEditMode = !!id;
  const calculatedCalories = calculateCalories();
  const caloriesDifference = Math.abs(calculatedCalories - formData.per100g.kcal);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
            {isEditMode ? 'Modifica Alimento' : 'Nuovo Alimento'}
          </h1>
          <p style={{ color: '#6b7280' }}>
            {isEditMode ? 'Modifica i dettagli dell\'alimento' : 'Crea un nuovo alimento con tutti i valori nutrizionali'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
        
        {/* Informazioni base dell'alimento */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            Informazioni Base
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
                Nome Alimento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Es. Petto di Pollo"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              {errors.name && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>
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
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.category ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="">Seleziona categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.category}</p>
              )}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Marca (opzionale)
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Es. BioFresh"
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
                Codice a Barre (opzionale)
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Es. 8001234567890"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Valori nutrizionali per 100g */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            Valori Nutrizionali per 100g
          </h2>
          
          {/* Macronutrienti */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
              Macronutrienti
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Calorie (kcal)
                </label>
                <input
                  type="number"
                  value={formData.per100g.kcal}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, kcal: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.kcal ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.kcal && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.kcal}</p>
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
                  Proteine (g)
                </label>
                <input
                  type="number"
                  value={formData.per100g.protein}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, protein: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.protein ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.protein && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.protein}</p>
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
                  Carboidrati (g)
                </label>
                <input
                  type="number"
                  value={formData.per100g.carbs}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, carbs: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.carbs ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.carbs && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.carbs}</p>
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
                  Grassi (g)
                </label>
                <input
                  type="number"
                  value={formData.per100g.fats}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, fats: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.fats ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.fats && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.fats}</p>
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
                  Fibra (g)
                </label>
                <input
                  type="number"
                  value={formData.per100g.fiber}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, fiber: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.fiber ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.fiber && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.fiber}</p>
                )}
              </div>
            </div>

            {/* Validazione macronutrienti */}
            {errors.macros && (
              <div style={{ 
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem'
              }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.macros}</p>
              </div>
            )}

            {/* Calcolo automatico calorie */}
            {calculatedCalories > 0 && (
              <div style={{ 
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: calculatedCalories === formData.per100g.kcal ? '#f0fdf4' : '#fef3c7',
                border: `1px solid ${calculatedCalories === formData.per100g.kcal ? '#bbf7d0' : '#fde68a'}`,
                borderRadius: '0.5rem'
              }}>
                <p style={{ 
                  color: calculatedCalories === formData.per100g.kcal ? '#166534' : '#92400e',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {calculatedCalories === formData.per100g.kcal 
                    ? '✅ Calorie calcolate correttamente dai macronutrienti'
                    : `⚠️ Calorie calcolate: ${Math.round(calculatedCalories)} kcal (differenza: ${Math.round(caloriesDifference)} kcal)`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Micronutrienti */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
              Micronutrienti
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Sodio (mg)
                </label>
                <input
                  type="number"
                  value={formData.per100g.sodium}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, sodium: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.sodium ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.sodium && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.sodium}</p>
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
                  Potassio (mg)
                </label>
                <input
                  type="number"
                  value={formData.per100g.potassium}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, potassium: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.potassium ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.potassium && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.potassium}</p>
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
                  Calcio (mg)
                </label>
                <input
                  type="number"
                  value={formData.per100g.calcium}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, calcium: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.calcium ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.calcium && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.calcium}</p>
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
                  Ferro (mg)
                </label>
                <input
                  type="number"
                  value={formData.per100g.iron}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, iron: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.iron ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.iron && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.iron}</p>
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
                  Vitamina C (mg)
                </label>
                <input
                  type="number"
                  value={formData.per100g.vitaminC}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, vitaminC: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.vitaminC ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.vitaminC && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.vitaminC}</p>
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
                  Vitamina D (μg)
                </label>
                <input
                  type="number"
                  value={formData.per100g.vitaminD}
                  onChange={(e) => setFormData({
                    ...formData,
                    per100g: { ...formData.per100g, vitaminD: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.vitaminD ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.vitaminD && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.vitaminD}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            Tag e Categorizzazione
          </h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Aggiungi Tag
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Inserisci un tag..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Aggiungi
              </button>
            </div>
          </div>

          {/* Tag comuni */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Tag comuni (clicca per aggiungere):
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {commonTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.includes(tag)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: formData.tags.includes(tag) ? '#9ca3af' : '#f3f4f6',
                    color: formData.tags.includes(tag) ? '#6b7280' : '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: formData.tags.includes(tag) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Tag selezionati */}
          {formData.tags.length > 0 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Tag selezionati:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.tags.map(tag => (
                  <div
                    key={tag}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      border: '1px solid #93c5fd',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1e40af',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        padding: '0',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
            {isSubmitting ? 'Salvataggio...' : (isEditMode ? 'Aggiorna Alimento' : 'Crea Alimento')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodForm;

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createMeal } from '../features/meals/mealsSlice';
import { searchFoodByName, calculateNutritionForGrams } from '../services/nutritionApi';
import type { Meal, MealItem } from '../types';

interface WeeklyMealPlannerProps {
  selectedFoods: string[];
  onMealsCreated: (count: number) => void;
}

const WeeklyMealPlanner: React.FC<WeeklyMealPlannerProps> = ({ selectedFoods: propSelectedFoods, onMealsCreated }) => {
  const dispatch = useAppDispatch();
  const [selectedFoods, setSelectedFoods] = useState<string[]>(propSelectedFoods);
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, Record<string, string[]>>>({});
  const [isCreating, setIsCreating] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealTypeLabels = {
    breakfast: 'Colazione',
    lunch: 'Pranzo', 
    dinner: 'Cena',
    snack: 'Spuntino'
  };

  // Aggiungi alimento alla lista
  const addFood = (foodName: string) => {
    if (!selectedFoods.includes(foodName)) {
      setSelectedFoods([...selectedFoods, foodName]);
    }
  };

  // Rimuovi alimento dalla lista
  const removeFood = (foodName: string) => {
    setSelectedFoods(selectedFoods.filter(f => f !== foodName));
    // Rimuovi anche da tutti i pasti
    const newPlan = { ...weeklyPlan };
    Object.keys(newPlan).forEach(day => {
      Object.keys(newPlan[day]).forEach(mealType => {
        newPlan[day][mealType] = newPlan[day][mealType].filter(f => f !== foodName);
      });
    });
    setWeeklyPlan(newPlan);
  };

  // Assegna alimento a un pasto specifico
  const assignFoodToMeal = (day: string, mealType: string, foodName: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: [...(prev[day]?.[mealType] || []), foodName]
      }
    }));
  };

  // Rimuovi alimento da un pasto specifico
  const removeFoodFromMeal = (day: string, mealType: string, foodName: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: (prev[day]?.[mealType] || []).filter(f => f !== foodName)
      }
    }));
  };

  // Crea tutti i pasti della settimana
  const createWeeklyMeals = async () => {
    setIsCreating(true);
    let createdCount = 0;
    const errors: string[] = [];

    try {
      for (const day of days) {
        const dayPlan = weeklyPlan[day];
        if (!dayPlan) continue;

        for (const mealType of mealTypes) {
          const foods = dayPlan[mealType] || [];
          if (foods.length === 0) continue;

          try {
            // Crea gli item del pasto
            const mealItems: MealItem[] = [];
            
            for (const foodName of foods) {
              // Cerca i dati nutrizionali
              const nutritionData = await searchFoodByName(foodName);
              if (nutritionData) {
                // Usa quantità standard (da personalizzare)
                const standardGrams = getStandardGrams(mealType);
                const calculatedNutrition = calculateNutritionForGrams(nutritionData, standardGrams);
                
                mealItems.push({
                  foodId: nutritionData.id,
                  foodName: foodName,
                  grams: standardGrams,
                  notes: `Quantità standard per ${mealTypeLabels[mealType as keyof typeof mealTypeLabels]}`
                });
              } else {
                errors.push(`Alimento '${foodName}' non trovato nel database nutrizionale`);
              }
            }

            if (mealItems.length > 0) {
              // Calcola la data (questa settimana + offset del giorno)
              const today = new Date();
              const dayOffset = days.indexOf(day);
              const targetDate = new Date(today);
              targetDate.setDate(today.getDate() + dayOffset);
              const dateString = targetDate.toISOString().split('T')[0];

              const newMeal: Omit<Meal, 'id'> = {
                userId: '1', // Hardcoded per ora
                date: dateString,
                type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
                items: mealItems,
                completed: false,
                notes: `Pasto ${mealTypeLabels[mealType as keyof typeof mealTypeLabels]} - ${foods.length} alimenti`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              await dispatch(createMeal(newMeal)).unwrap();
              createdCount++;
            }
          } catch (error) {
            errors.push(`Errore nel creare il pasto ${day}-${mealType}: ${error}`);
          }
        }
      }

      onMealsCreated(createdCount);
      
      if (errors.length > 0) {
        console.warn('Errori durante la creazione:', errors);
      }

    } catch (error) {
      console.error('Errore generale:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Quantità standard per tipo di pasto
  const getStandardGrams = (mealType: string): number => {
    const standards = {
      breakfast: 150,
      lunch: 200,
      dinner: 180,
      snack: 100
    };
    return standards[mealType as keyof typeof standards] || 150;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '2rem' }}>
        📅 Pianificatore Settimanale
      </h2>

      {/* Lista Alimenti Selezionati */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          🍎 Alimenti Selezionati
        </h3>
        
        {selectedFoods.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            Nessun alimento selezionato. Usa il template CSV per aggiungere alimenti.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedFoods.map(food => (
              <div
                key={food}
                style={{
                  backgroundColor: '#f3f4f6',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '0.875rem' }}>{food}</span>
                <button
                  onClick={() => removeFood(food)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendario Settimanale */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          📅 Distribuzione Settimanale
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Giorno
                </th>
                {mealTypes.map(mealType => (
                  <th key={mealType} style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    {mealTypeLabels[mealType as keyof typeof mealTypeLabels]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td style={{ 
                    padding: '0.75rem', 
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {day === 'monday' ? 'Lunedì' :
                     day === 'tuesday' ? 'Martedì' :
                     day === 'wednesday' ? 'Mercoledì' :
                     day === 'thursday' ? 'Giovedì' :
                     day === 'friday' ? 'Venerdì' :
                     day === 'saturday' ? 'Sabato' : 'Domenica'}
                  </td>
                  {mealTypes.map(mealType => (
                    <td key={mealType} style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ minHeight: '60px' }}>
                        {(weeklyPlan[day]?.[mealType] || []).map(food => (
                          <div
                            key={food}
                            style={{
                              backgroundColor: '#e0f2fe',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              marginBottom: '0.25rem',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span>{food}</span>
                            <button
                              onClick={() => removeFoodFromMeal(day, mealType, food)}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.125rem',
                                padding: '0.125rem 0.25rem',
                                fontSize: '0.625rem',
                                cursor: 'pointer'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        
                        {/* Dropdown per aggiungere alimenti */}
                        {selectedFoods.length > 0 && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                assignFoodToMeal(day, mealType, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              fontSize: '0.75rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value="">+ Aggiungi alimento</option>
                            {selectedFoods
                              .filter(food => !(weeklyPlan[day]?.[mealType] || []).includes(food))
                              .map(food => (
                                <option key={food} value={food}>{food}</option>
                              ))}
                          </select>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pulsante Crea Pasti */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={createWeeklyMeals}
          disabled={isCreating || selectedFoods.length === 0}
          style={{
            backgroundColor: selectedFoods.length === 0 ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: selectedFoods.length === 0 ? 'not-allowed' : 'pointer',
            opacity: selectedFoods.length === 0 ? 0.6 : 1
          }}
        >
          {isCreating ? '⏳ Creando pasti...' : `📅 Crea Pasti Settimanali (${selectedFoods.length} alimenti)`}
        </button>
      </div>
    </div>
  );
};

export default WeeklyMealPlanner;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Meal, MealItem, Food } from '../../types';
import { API_CONFIG } from '../../config/api';

// Stato iniziale
interface MealsState {
  meals: Meal[];
  currentMeal: Meal | null;
  isLoading: boolean;
  error: string | null;
  selectedDate: string; // Data selezionata per i pasti
}

const initialState: MealsState = {
  meals: [],
  currentMeal: null,
  isLoading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0], // Oggi
};

// Utility per calcolare i nutrienti di un pasto
const calculateMealNutrients = (items: MealItem[]): {
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
} => {
  return items.reduce((totals, item) => {
    const ratio = item.grams / 100; // Rapporto per calcolare i nutrienti
    
    // Controllo robusto per per100g
    if (item.food && item.food.per100g && typeof item.food.per100g === 'object') {
      return {
        kcal: totals.kcal + ((item.food.per100g.kcal || 0) * ratio),
        protein: totals.protein + ((item.food.per100g.protein || 0) * ratio),
        carbs: totals.carbs + ((item.food.per100g.carbs || 0) * ratio),
        fats: totals.fats + ((item.food.per100g.fats || 0) * ratio),
        fiber: totals.fiber + ((item.food.per100g.fiber || 0) * ratio),
        sodium: totals.sodium + ((item.food.per100g.sodium || 0) * ratio),
        potassium: totals.potassium + ((item.food.per100g.potassium || 0) * ratio),
        calcium: totals.calcium + ((item.food.per100g.calcium || 0) * ratio),
        iron: totals.iron + ((item.food.per100g.iron || 0) * ratio),
        vitaminC: totals.vitaminC + ((item.food.per100g.vitaminC || 0) * ratio),
        vitaminD: totals.vitaminD + ((item.food.per100g.vitaminD || 0) * ratio),
      };
    } else {
      // Fallback per alimenti senza dati nutrizionali completi
      console.warn(`Alimento ${item.foodName || 'sconosciuto'} non ha dati nutrizionali completi`);
      return totals; // Ritorna i totali invariati
    }
  }, {
    kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0,
    sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminC: 0, vitaminD: 0
  });
};

// Utility per calcolare i nutrienti totali di un pasto
const calculateTotalMealNutrients = (items: MealItem[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  vitaminD: number;
} => {
  const nutrients = calculateMealNutrients(items);
  return {
    calories: Math.round(nutrients.kcal),
    protein: Math.round(nutrients.protein * 10) / 10,
    carbs: Math.round(nutrients.carbs * 10) / 10,
    fat: Math.round(nutrients.fats * 10) / 10,
    fiber: Math.round(nutrients.fiber * 10) / 10,
    sodium: Math.round(nutrients.sodium * 10) / 10,
    potassium: Math.round(nutrients.potassium * 10) / 10,
    calcium: Math.round(nutrients.calcium * 10) / 10,
    iron: Math.round(nutrients.iron * 10) / 10,
    vitaminC: Math.round(nutrients.vitaminC * 10) / 10,
    vitaminD: Math.round(nutrients.vitaminD * 10) / 10,
  };
};

// Thunk per recuperare tutti i pasti
export const fetchMeals = createAsyncThunk(
  'meals/fetchMeals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/meals`);
      if (!response.ok) {
        throw new Error('Errore nel recupero dei pasti');
      }
      const meals = await response.json();
      return meals;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per recuperare i pasti di una data specifica
export const fetchMealsByDate = createAsyncThunk(
  'meals/fetchMealsByDate',
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      // Per ora carichiamo tutti i pasti e filtriamo lato client
      // In futuro potremmo implementare un endpoint personalizzato
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/meals`);
      if (!response.ok) {
        throw new Error('Errore nel recupero dei pasti per la data');
      }
      const allMeals = await response.json();
      
      // Filtra i pasti per il range di date
      const filteredMeals = allMeals.filter((meal: Meal) => {
        const mealDate = new Date(meal.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return mealDate >= startDate && mealDate <= endDate;
      });
      
      return filteredMeals;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per recuperare tutti i pasti (per il catalogo)
export const fetchAllMeals = createAsyncThunk(
  'meals/fetchAllMeals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/meals`);
      if (!response.ok) {
        throw new Error('Errore nel recupero di tutti i pasti');
      }
      const meals = await response.json();
      return meals;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per recuperare un pasto specifico per ID
export const fetchMealById = createAsyncThunk(
  'meals/fetchMealById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/meals/${id}`);
      if (!response.ok) {
        throw new Error('Errore nel recupero del pasto');
      }
      const meal = await response.json();
      return meal;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per creare un nuovo pasto
export const createMeal = createAsyncThunk(
  'meals/createMeal',
  async (mealData: Omit<Meal, 'id'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const foods = state.foods.foods || [];
      
      // Arricchisci gli items con l'oggetto food completo
      const enrichedItems = mealData.items.map(item => {
        const fullFood = foods.find((f: Food) => f.id === item.foodId);
        return {
          ...item,
          food: fullFood || { id: item.foodId, name: item.foodName, per100g: {} }
        };
      });

      // Calcola i nutrienti per ogni item del pasto
      const itemsWithNutrients = enrichedItems.map(item => ({
        ...item,
        calculatedNutrients: calculateMealNutrients([item])
      }));

      // Calcola i nutrienti totali del pasto
      const totalNutrients = calculateTotalMealNutrients(itemsWithNutrients);
      
      const mealToCreate = {
        ...mealData,
        items: itemsWithNutrients,
        ...totalNutrients
      };

      const response = await fetch('http://localhost:3001/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealToCreate),
      });
      if (!response.ok) {
        throw new Error('Errore nella creazione del pasto');
      }
      const newMeal = await response.json();
      return newMeal;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per aggiornare un pasto
export const updateMeal = createAsyncThunk(
  'meals/updateMeal',
  async ({ id, mealData }: { id: string; mealData: Partial<Meal> }, { rejectWithValue, getState }) => {
    try {
      let updatedMeal = { ...mealData };

      // Se ci sono items, ricalcola i nutrienti
      if (mealData.items) {
        const state = getState() as any;
        const foods = state.foods.foods || [];
        
        // Arricchisci gli items con l'oggetto food completo
        const enrichedItems = mealData.items.map(item => {
          const fullFood = foods.find((f: Food) => f.id === item.foodId);
          return {
            ...item,
            food: fullFood || { id: item.foodId, name: item.foodName, per100g: {} }
          };
        });

        const itemsWithNutrients = enrichedItems.map(item => ({
          ...item,
          calculatedNutrients: calculateMealNutrients([item])
        }));
        updatedMeal.items = itemsWithNutrients;
        
        // Ricalcola i nutrienti totali del pasto
        const totalNutrients = calculateTotalMealNutrients(itemsWithNutrients);
        Object.assign(updatedMeal, totalNutrients);
      }

      const response = await fetch(`http://localhost:3001/meals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMeal),
      });
      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del pasto');
      }
      const updatedMealResponse = await response.json();
      return updatedMealResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per eliminare un pasto
export const deleteMeal = createAsyncThunk(
  'meals/deleteMeal',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/meals/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione del pasto');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per eliminare tutti i pasti
export const deleteAllMeals = createAsyncThunk(
  'meals/deleteAllMeals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3001/meals', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione di tutti i pasti');
      }
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per completare un pasto
export const completeMeal = createAsyncThunk(
  'meals/completeMeal',
  async ({ id, completed }: { id: string; completed: boolean }, { rejectWithValue, getState }) => {
    try {
      // Prima recupera il pasto corrente per ricalcolare i nutrienti
      const state = getState() as any;
      const currentMeal = state.meals.meals.find((meal: Meal) => meal.id === id);
      
      if (!currentMeal) {
        throw new Error('Pasto non trovato');
      }
      
      // Ricalcola i nutrienti totali
      const totalNutrients = calculateTotalMealNutrients(currentMeal.items);
      
      const updateData = {
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
        ...totalNutrients
      };

      const response = await fetch(`http://localhost:3001/meals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dello stato del pasto');
      }
      const updatedMeal = await response.json();
      return updatedMeal;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per aggiungere un alimento a un pasto esistente
export const addFoodToMeal = createAsyncThunk(
  'meals/addFoodToMeal',
  async ({ mealId, food, grams }: { mealId: string; food: Food; grams: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const currentMeal = state.meals.meals.find((m: Meal) => m.id === mealId);
      
      if (!currentMeal) {
        throw new Error('Pasto non trovato');
      }

      const newItem: MealItem = {
        foodId: food.id,
        foodName: food.name,
        food,
        grams,
        calculatedNutrients: calculateMealNutrients([{ foodId: food.id, foodName: food.name, food, grams, calculatedNutrients: food.per100g }])
      };

      const updatedItems = [...currentMeal.items, newItem];
      
      // Calcola i nutrienti totali del pasto aggiornato
      const totalNutrients = calculateTotalMealNutrients(updatedItems);
      
      const updatedMeal = {
        ...currentMeal,
        items: updatedItems,
        ...totalNutrients
      };

      const response = await fetch(`http://localhost:3001/meals/${mealId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedItems }),
      });
      if (!response.ok) {
        throw new Error('Errore nell\'aggiunta dell\'alimento al pasto');
      }
      const updatedMealResponse = await response.json();
      return updatedMealResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMeal: (state) => {
      state.currentMeal = null;
    },
    setCurrentMeal: (state, action: PayloadAction<Meal | null>) => {
      state.currentMeal = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Meals
      .addCase(fetchMeals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMeals.fulfilled, (state, action: PayloadAction<Meal[]>) => {
        state.isLoading = false;
        state.meals = action.payload;
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Meals by Date
      .addCase(fetchMealsByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealsByDate.fulfilled, (state, action: PayloadAction<Meal[]>) => {
        state.isLoading = false;
        state.meals = action.payload;
      })
      .addCase(fetchMealsByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch All Meals
      .addCase(fetchAllMeals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMeals.fulfilled, (state, action: PayloadAction<Meal[]>) => {
        state.isLoading = false;
        state.meals = action.payload;
      })
      .addCase(fetchAllMeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Meal by ID
      .addCase(fetchMealById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealById.fulfilled, (state, action: PayloadAction<Meal>) => {
        state.isLoading = false;
        state.currentMeal = action.payload;
      })
      .addCase(fetchMealById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Meal
      .addCase(createMeal.fulfilled, (state, action: PayloadAction<Meal>) => {
        state.meals.push(action.payload);
        if (state.currentMeal?.id === action.payload.id) {
          state.currentMeal = action.payload;
        }
      })
      
      // Update Meal
      .addCase(updateMeal.fulfilled, (state, action: PayloadAction<Meal>) => {
        const index = state.meals.findIndex(meal => meal.id === action.payload.id);
        if (index !== -1) {
          state.meals[index] = action.payload;
        }
        if (state.currentMeal?.id === action.payload.id) {
          state.currentMeal = action.payload;
        }
      })
      
      // Delete Meal
      .addCase(deleteMeal.fulfilled, (state, action: PayloadAction<string>) => {
        state.meals = state.meals.filter(meal => meal.id !== action.payload);
        if (state.currentMeal?.id === action.payload) {
          state.currentMeal = null;
        }
      })
      
      // Delete All Meals
      .addCase(deleteAllMeals.fulfilled, (state) => {
        state.meals = [];
        state.currentMeal = null;
      })
      
      // Complete Meal
      .addCase(completeMeal.fulfilled, (state, action: PayloadAction<Meal>) => {
        const index = state.meals.findIndex(meal => meal.id === action.payload.id);
        if (index !== -1) {
          state.meals[index] = action.payload;
        }
        if (state.currentMeal?.id === action.payload.id) {
          state.currentMeal = action.payload;
        }
      })
      
      // Add Food to Meal
      .addCase(addFoodToMeal.fulfilled, (state, action: PayloadAction<Meal>) => {
        const index = state.meals.findIndex(meal => meal.id === action.payload.id);
        if (index !== -1) {
          state.meals[index] = action.payload;
        }
        if (state.currentMeal?.id === action.payload.id) {
          state.currentMeal = action.payload;
        }
      });
  },
});

export const { 
  setSelectedDate, 
  clearError, 
  clearCurrentMeal, 
  setCurrentMeal 
} = mealsSlice.actions;

export default mealsSlice.reducer;

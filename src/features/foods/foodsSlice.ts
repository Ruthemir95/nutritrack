import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Food, FoodFilters, Pagination } from '../../types';

// Stato iniziale
interface FoodsState {
  foods: Food[];
  filteredFoods: Food[];
  currentFood: Food | null;
  filters: FoodFilters;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

const initialState: FoodsState = {
  foods: [],
  filteredFoods: [],
  currentFood: null,
  filters: {
    search: '',
    category: '',
    macroDominant: '',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  isLoading: false,
  error: null
};

// Thunk per recuperare tutti gli alimenti
export const fetchFoods = createAsyncThunk(
  'foods/fetchFoods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3001/foods');
      if (!response.ok) {
        throw new Error('Errore nel recupero degli alimenti');
      }
      const foods = await response.json();
      return foods;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per recuperare un alimento specifico
export const fetchFoodById = createAsyncThunk(
  'foods/fetchFoodById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/foods/${id}`);
      if (!response.ok) {
        throw new Error('Alimento non trovato');
      }
      const food = await response.json();
      return food;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per creare un nuovo alimento
export const createFood = createAsyncThunk(
  'foods/createFood',
  async (food: Omit<Food, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3001/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(food),
      });
      if (!response.ok) {
        throw new Error('Errore nella creazione dell\'alimento');
      }
      const newFood = await response.json();
      return newFood;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per aggiornare un alimento
export const updateFood = createAsyncThunk(
  'foods/updateFood',
  async ({ id, food }: { id: string; food: Partial<Food> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/foods/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(food),
      });
      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dell\'alimento');
      }
      const updatedFood = await response.json();
      return updatedFood;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per eliminare un alimento
export const deleteFood = createAsyncThunk(
  'foods/deleteFood',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/foods/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'alimento');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

// Thunk per eliminare tutti gli alimenti
export const deleteAllFoods = createAsyncThunk(
  'foods/deleteAllFoods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3001/foods', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione di tutti gli alimenti');
      }
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }
);

const foodsSlice = createSlice({
  name: 'foods',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FoodFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset alla prima pagina quando cambiano i filtri
    },
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFood: (state) => {
      state.currentFood = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Foods
      .addCase(fetchFoods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFoods.fulfilled, (state, action: PayloadAction<Food[]>) => {
        state.isLoading = false;
        state.foods = action.payload;
        state.filteredFoods = action.payload;
        state.pagination.total = action.payload.length;
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.limit);
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Food by ID
      .addCase(fetchFoodById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFoodById.fulfilled, (state, action: PayloadAction<Food>) => {
        state.isLoading = false;
        state.currentFood = action.payload;
      })
      .addCase(fetchFoodById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Food
      .addCase(createFood.fulfilled, (state, action: PayloadAction<Food>) => {
        state.foods.push(action.payload);
        state.filteredFoods.push(action.payload);
        state.pagination.total += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      })
      
      // Update Food
      .addCase(updateFood.fulfilled, (state, action: PayloadAction<Food>) => {
        const index = state.foods.findIndex(food => food.id === action.payload.id);
        if (index !== -1) {
          state.foods[index] = action.payload;
          state.filteredFoods[index] = action.payload;
        }
        if (state.currentFood?.id === action.payload.id) {
          state.currentFood = action.payload;
        }
      })
      
      // Delete Food
      .addCase(deleteFood.fulfilled, (state, action: PayloadAction<string>) => {
        state.foods = state.foods.filter(food => food.id !== action.payload);
        state.filteredFoods = state.filteredFoods.filter(food => food.id !== action.payload);
        state.pagination.total -= 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      })
      
      // Delete All Foods
      .addCase(deleteAllFoods.fulfilled, (state) => {
        state.foods = [];
        state.filteredFoods = [];
        state.pagination.total = 0;
        state.pagination.totalPages = 0;
        state.currentFood = null;
      });
  },
});

export const { setFilters, setPagination, clearError, clearCurrentFood } = foodsSlice.actions;
export default foodsSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import foodsReducer from '../features/foods/foodsSlice';
import mealsReducer from '../features/meals/mealsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    foods: foodsReducer,
    meals: mealsReducer,
    // Altri reducer verranno aggiunti qui
    // plans: plansReducer,
    // tracking: trackingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora le azioni non serializzabili per i timestamp
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

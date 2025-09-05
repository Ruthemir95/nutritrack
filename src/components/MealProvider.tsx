import React, { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { fetchAllMeals } from '../features/meals/mealsSlice';

interface MealProviderProps {
  children: React.ReactNode;
}

const MealProvider: React.FC<MealProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Carica tutti i pasti all'avvio dell'app
    dispatch(fetchAllMeals());
  }, [dispatch]);

  return <>{children}</>;
};

export default MealProvider;

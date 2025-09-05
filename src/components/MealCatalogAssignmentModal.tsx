import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAllMeals, createMeal } from '../features/meals/mealsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SunIcon, HeartIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { Meal } from '../types';

interface MealCatalogAssignmentModalProps {
  selectedDate: string;
  selectedMealType: string;
  onMealAssigned: () => void;
  onClose: () => void;
}

const MealCatalogAssignmentModal: React.FC<MealCatalogAssignmentModalProps> = ({
  selectedDate,
  selectedMealType,
  onMealAssigned,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { meals: allMeals, isLoading } = useAppSelector(state => state.meals);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestisce la chiusura con il tasto Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Previene lo scroll del body quando la modale è aperta
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const mealTypeIcons = {
    breakfast: SunIcon,
    lunch: HeartIcon,
    dinner: MoonIcon,
    snack: SparklesIcon,
  };

  const mealTypeLabels = {
    breakfast: 'Colazione',
    lunch: 'Pranzo',
    dinner: 'Cena',
    snack: 'Spuntino'
  };

  // Filtra i pasti per tipo selezionato
  const filteredMeals = allMeals.filter(meal => meal.type === selectedMealType);

  const handleAssignMeal = async () => {
    if (!selectedMeal) return;

    setIsSubmitting(true);
    try {
      // Crea una copia del pasto con la nuova data
      const newMeal: Omit<Meal, 'id'> = {
        ...selectedMeal,
        date: selectedDate,
        completed: false
      };

      await dispatch(createMeal(newMeal)).unwrap();
      onMealAssigned();
    } catch (error) {
      console.error('Errore durante l\'assegnazione del pasto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assegna Pasto</h2>
              <p className="text-gray-600 mt-1">
                {mealTypeLabels[selectedMealType as keyof typeof mealTypeLabels]} - {new Date(selectedDate).toLocaleDateString('it-IT')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Caricamento pasti...</span>
              </div>
            ) : filteredMeals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {React.createElement(mealTypeIcons[selectedMealType as keyof typeof mealTypeIcons], { className: "w-8 h-8 text-gray-400" })}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun pasto disponibile</h3>
                <p className="text-gray-600">
                  Non ci sono pasti di tipo "{mealTypeLabels[selectedMealType as keyof typeof mealTypeLabels]}" nel catalogo.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Seleziona un pasto dal catalogo:
                </h3>
                <div className="grid gap-3">
                  {filteredMeals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMeal?.id === meal.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMeal(meal)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedMeal?.id === meal.id ? 'bg-primary-100' : 'bg-gray-100'
                          }`}>
                            {React.createElement(mealTypeIcons[meal.type], { 
                              className: `w-5 h-5 ${selectedMeal?.id === meal.id ? 'text-primary-600' : 'text-gray-600'}` 
                            })}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{meal.name || mealTypeLabels[meal.type]}</h4>
                            <p className="text-sm text-gray-600">
                              {meal.calories ? Math.round(meal.calories) : 0} kcal
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            P: {Math.round(meal.protein || 0)}g
                          </div>
                          <div className="text-sm text-gray-600">
                            C: {Math.round(meal.carbs || 0)}g
                          </div>
                          <div className="text-sm text-gray-600">
                            G: {Math.round(meal.fat || 0)}g
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleAssignMeal}
              disabled={!selectedMeal || isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Assegnando...' : 'Assegna Pasto'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MealCatalogAssignmentModal;

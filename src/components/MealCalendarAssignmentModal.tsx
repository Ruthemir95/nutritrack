import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../app/hooks';
import { fetchAllMeals, createMeal } from '../features/meals/mealsSlice';
import type { Meal } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CalendarDaysIcon, 
  SunIcon, 
  HeartIcon, 
  MoonIcon, 
  SparklesIcon,
  FireIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface MealCalendarAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedMealType: string;
  onMealAssigned: () => void;
}

const MealCalendarAssignmentModal: React.FC<MealCalendarAssignmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedMealType,
  onMealAssigned
}) => {
  const dispatch = useAppDispatch();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      loadMeals();
    }
  }, [isOpen]);

  const loadMeals = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(fetchAllMeals()).unwrap();
      setMeals(result);
    } catch (error) {
      console.error('Errore nel caricamento dei pasti:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignMeal = async (meal: Meal) => {
    console.log('Assegnazione pasto:', { meal, selectedDate, selectedMealType });
    
    setIsSubmitting(true);
    try {
      const newMeal: Omit<Meal, 'id'> = {
        ...meal,
        date: selectedDate,
        type: selectedMealType as any,
        userId: 'user-1', // TODO: Usare l'ID utente corrente
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await dispatch(createMeal(newMeal)).unwrap();
      console.log('Pasto assegnato con successo');
      onMealAssigned();
      onClose();
    } catch (error) {
      console.error('Errore nell\'assegnazione del pasto:', error);
      alert('Errore nell\'assegnazione del pasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealTypeLabels = {
    breakfast: 'Colazione',
    lunch: 'Pranzo',
    dinner: 'Cena',
    snack: 'Spuntino'
  };

  const mealTypeIcons = {
    breakfast: SunIcon,
    lunch: HeartIcon,
    dinner: MoonIcon,
    snack: SparklesIcon
  };

  const mealTypeColors = {
    breakfast: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    lunch: 'bg-red-50 border-red-200 text-red-800',
    dinner: 'bg-blue-50 border-blue-200 text-blue-800',
    snack: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalGrams = (meal: Meal) => {
    return meal.items.reduce((sum, item) => sum + item.grams, 0);
  };

  const getMealNutrition = (meal: Meal) => {
    return {
      calories: Math.round(meal.calories || 0),
      protein: Math.round(meal.protein || 0),
      carbs: Math.round(meal.carbs || 0),
      fats: Math.round(meal.fats || 0)
    };
  };

  if (!isOpen) return null;

  const IconComponent = mealTypeIcons[selectedMealType as keyof typeof mealTypeIcons];
  const colorClass = mealTypeColors[selectedMealType as keyof typeof mealTypeColors];

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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Assegna Pasto
                </h2>
                <p className="text-sm text-neutral-500">
                  Seleziona un pasto da assegnare al calendario
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-neutral-400" />
            </button>
          </div>

          {/* Info Pasto */}
          <div className="p-6 border-b border-neutral-200">
            <Card className={`p-4 ${colorClass}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-50 rounded-lg">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {mealTypeLabels[selectedMealType as keyof typeof mealTypeLabels]}
                  </h3>
                  <p className="text-sm opacity-80">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Lista Pasti */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-neutral-600">Caricamento pasti...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meals.length === 0 ? (
                  <Card className="p-12 text-center">
                    <HeartIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      Nessun pasto disponibile
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Crea prima un pasto nella sezione "Pasti"
                    </p>
                    <Button onClick={onClose} variant="primary">
                      Chiudi
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {meals.map((meal, index) => {
                      const nutrition = getMealNutrition(meal);
                      const totalGrams = getTotalGrams(meal);
                      
                      return (
                        <motion.div
                          key={`${meal.id}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card 
                            className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                            onClick={() => !isSubmitting && handleAssignMeal(meal)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">
                                    {meal.notes || 'Pasto senza nome'}
                                  </h3>
                                  <Badge variant="gray" className="text-xs">
                                    {meal.items.length} alimenti
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-neutral-600 mb-3">
                                  {totalGrams}g totali • {meal.items.map(item => item.foodName).join(', ')}
                                </div>

                                {/* Valori nutrizionali */}
                                {nutrition.calories > 0 && (
                                  <div className="grid grid-cols-4 gap-2 mb-3">
                                    <div className="text-center p-2 bg-red-50 rounded-lg">
                                      <div className="text-sm font-bold text-red-600">
                                        {nutrition.calories}
                                      </div>
                                      <div className="text-xs text-neutral-600">kcal</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                                      <div className="text-sm font-bold text-blue-600">
                                        {nutrition.protein}g
                                      </div>
                                      <div className="text-xs text-neutral-600">Proteine</div>
                                    </div>
                                    <div className="text-center p-2 bg-amber-50 rounded-lg">
                                      <div className="text-sm font-bold text-amber-600">
                                        {nutrition.carbs}g
                                      </div>
                                      <div className="text-xs text-neutral-600">Carboidrati</div>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 rounded-lg">
                                      <div className="text-sm font-bold text-green-600">
                                        {nutrition.fats}g
                                      </div>
                                      <div className="text-xs text-neutral-600">Grassi</div>
                                    </div>
                                  </div>
                                )}

                                {/* Data creazione */}
                                <div className="flex items-center gap-1 text-xs text-neutral-500">
                                  <ClockIcon className="w-3 h-3" />
                                  Creato il {new Date(meal.createdAt).toLocaleDateString('it-IT')}
                                </div>
                              </div>

                              <div className="flex-shrink-0">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={isSubmitting}
                                  className="flex items-center gap-2 min-w-[100px]"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Assegnando...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircleIcon className="w-4 h-4" />
                                      Assegna
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MealCalendarAssignmentModal;
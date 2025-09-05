import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAllMeals, updateMeal, deleteMeal } from '../features/meals/mealsSlice';
import MealCreator from './MealCreator';
import type { Meal } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  FireIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

interface MealCatalogProps {
  onMealSelect?: (meal: Meal) => void;
  showAssignButton?: boolean;
}

const MealCatalog: React.FC<MealCatalogProps> = ({ onMealSelect, showAssignButton = false }) => {
  const dispatch = useAppDispatch();
  const { meals, isLoading } = useAppSelector(state => state.meals);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllMeals());
  }, [dispatch]);

  const mealTypeLabels = {
    breakfast: 'Colazione',
    lunch: 'Pranzo',
    dinner: 'Cena',
    snack: 'Spuntino'
  };

  const mealTypeColors = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-blue-100 text-blue-800',
    dinner: 'bg-purple-100 text-purple-800',
    snack: 'bg-green-100 text-green-800'
  };

  const mealTypeIcons = {
    breakfast: SunIcon,
    lunch: HeartIcon,
    dinner: MoonIcon,
    snack: SparklesIcon
  };

  const filteredMeals = meals?.filter(meal => {
    const matchesSearch = meal.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.items.some(item => item.foodName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !selectedType || meal.type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await dispatch(deleteMeal(mealId)).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Errore nell\'eliminazione del pasto:', error);
      alert('Errore nell\'eliminazione del pasto');
    }
  };

  const handleMealCreated = (meal: Meal) => {
    setEditingMeal(null);
    dispatch(fetchAllMeals());
  };

  const handleAssignMeal = (meal: Meal) => {
    if (onMealSelect) {
      onMealSelect(meal);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block w-12 h-12 border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Caricamento pasti...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Filtri */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca pasti
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Nome pasto o ingredienti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Pasto
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tutti i tipi</option>
              {Object.entries(mealTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista Pasti */}
      {filteredMeals.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nessun pasto trovato
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedType 
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia creando il tuo primo pasto personalizzato'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        {React.createElement(mealTypeIcons[meal.type as keyof typeof mealTypeIcons], { 
                          className: "w-5 h-5 text-primary-600" 
                        })}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${mealTypeColors[meal.type as keyof typeof mealTypeColors]}`}
                      >
                        {mealTypeLabels[meal.type as keyof typeof mealTypeLabels]}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {meal.notes || `${mealTypeLabels[meal.type as keyof typeof mealTypeLabels]} del ${new Date(meal.date).toLocaleDateString('it-IT')}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(meal.date).toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Valori Nutrizionali */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <FireIcon className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {meal.calories || 0}
                    </div>
                    <div className="text-xs text-gray-600">kcal</div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <HeartIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {meal.protein || 0}g
                    </div>
                    <div className="text-xs text-gray-600">Proteine</div>
                  </div>
                  
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <BoltIcon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-lg font-bold text-amber-600">
                      {meal.carbs || 0}g
                    </div>
                    <div className="text-xs text-gray-600">Carboidrati</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <SparklesIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {meal.fat || 0}g
                    </div>
                    <div className="text-xs text-gray-600">Grassi</div>
                  </div>
                </div>

                {/* Lista Alimenti */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Alimenti ({meal.items.length})
                  </h4>
                  <div className="space-y-1">
                    {meal.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-900 truncate flex-1">
                          {item.foodName}
                        </span>
                        <span className="text-gray-600 ml-2">
                          {item.grams}g
                        </span>
                      </div>
                    ))}
                    {meal.items.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{meal.items.length - 3} altri alimenti
                      </div>
                    )}
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditMeal(meal)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Modifica
                  </Button>
                  
                  {showAssignButton && (
                    <Button
                      onClick={() => handleAssignMeal(meal)}
                      variant="primary"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <CalendarDaysIcon className="w-4 h-4" />
                      Assegna
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => setShowDeleteConfirm(meal.id)}
                    variant="danger"
                    size="sm"
                    className="p-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal di conferma eliminazione */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Conferma Eliminazione
              </h3>
              <p className="text-gray-600 mb-6">
                Sei sicuro di voler eliminare questo pasto? Questa azione non può essere annullata.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Annulla
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteMeal(showDeleteConfirm)}
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Elimina
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal di modifica pasto */}
      <AnimatePresence>
        {editingMeal && (
          <MealCreator
            editingMeal={editingMeal}
            onMealCreated={handleMealCreated}
            onCancel={() => setEditingMeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealCatalog;
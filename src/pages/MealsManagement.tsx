import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAllMeals, deleteMeal, deleteAllMeals } from '../features/meals/mealsSlice';
import type { Meal } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MealCreator from '../components/MealCreator';
import MealDetail from '../components/MealDetail';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  PlusIcon, 
  PencilIcon, 
  EyeIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const MealsManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { meals, isLoading, error } = useAppSelector(state => state.meals);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');

  useEffect(() => {
    dispatch(fetchAllMeals());
  }, [dispatch]);

  const handleCreateMeal = () => {
    setSelectedMeal(null);
    setShowCreateModal(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowEditModal(true);
  };

  const handleViewMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowDetailModal(true);
  };

  const handleDeleteMeal = async (meal: Meal) => {
    if (window.confirm(`Sei sicuro di voler eliminare il pasto "${meal.notes || 'Senza nome'}"?`)) {
      try {
        await dispatch(deleteMeal(meal.id)).unwrap();
      } catch (error) {
        console.error('Errore durante l\'eliminazione del pasto:', error);
        alert('Errore durante l\'eliminazione del pasto');
      }
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedMeal(null);
  };

  const handleMealCreated = (meal: Meal) => {
    setShowCreateModal(false);
    setSelectedMeal(null);
    dispatch(fetchAllMeals());
  };

  const handleMealUpdated = (meal: Meal) => {
    setShowEditModal(false);
    setSelectedMeal(null);
    dispatch(fetchAllMeals());
  };

  const handleToggleSelect = () => {
    setIsSelecting(!isSelecting);
    setSelectedMeals([]);
  };

  const handleSelectMeal = (mealId: string) => {
    setSelectedMeals(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMeals.length === filteredMeals.length) {
      setSelectedMeals([]);
    } else {
      setSelectedMeals(filteredMeals.map(meal => meal.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMeals.length === 0) return;
    
    if (window.confirm(`Sei sicuro di voler eliminare ${selectedMeals.length} pasti selezionati?`)) {
      try {
        for (const mealId of selectedMeals) {
          await dispatch(deleteMeal(mealId)).unwrap();
        }
        setSelectedMeals([]);
        setIsSelecting(false);
      } catch (error) {
        console.error('Errore durante l\'eliminazione dei pasti selezionati:', error);
        alert('Errore durante l\'eliminazione dei pasti selezionati');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (meals.length === 0) return;
    
    if (window.confirm(`Sei sicuro di voler eliminare TUTTI i ${meals.length} pasti? Questa azione non può essere annullata.`)) {
      try {
        await dispatch(deleteAllMeals()).unwrap();
        setSelectedMeals([]);
        setIsSelecting(false);
      } catch (error) {
        console.error('Errore durante l\'eliminazione di tutti i pasti:', error);
        alert('Errore durante l\'eliminazione di tutti i pasti');
      }
    }
  };

  // Filtra i pasti
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = !searchTerm || 
      meal.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.items.some(item => item.foodName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !selectedMealType || meal.type === selectedMealType;
    
    return matchesSearch && matchesType;
  });

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

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2 flex items-center gap-3">
                <HeartIcon className="w-8 h-8 text-primary-500" />
                Gestione Pasti
              </h1>
              <p className="text-neutral-600 text-lg">
                Crea e gestisci il tuo catalogo di pasti personalizzati. Ogni pasto può essere modificato, duplicato e assegnato al calendario.
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                {filteredMeals.length} pasti disponibili
              </p>
            </div>
            <div className="flex gap-3">
              {isSelecting ? (
                <>
                  <Button onClick={handleSelectAll} variant="secondary" className="flex items-center gap-2 px-6 py-3">
                    {selectedMeals.length === filteredMeals.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
                  </Button>
                  <Button onClick={handleDeleteSelected} variant="danger" className="flex items-center gap-2 px-6 py-3" disabled={selectedMeals.length === 0}>
                    <TrashIcon className="w-5 h-5" />
                    Elimina Selezionati ({selectedMeals.length})
                  </Button>
                  <Button onClick={handleToggleSelect} variant="ghost" className="flex items-center gap-2 px-6 py-3">
                    Annulla
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleToggleSelect} variant="secondary" className="flex items-center gap-2 px-6 py-3">
                    <PencilIcon className="w-5 h-5" />
                    Seleziona
                  </Button>
                  <Button onClick={handleDeleteAll} variant="danger" className="flex items-center gap-2 px-6 py-3" disabled={meals.length === 0}>
                    <TrashIcon className="w-5 h-5" />
                    Elimina Tutto
                  </Button>
                  <Button onClick={handleCreateMeal} variant="primary" className="flex items-center gap-2 px-6 py-3">
                    <PlusIcon className="w-5 h-5" />
                    Nuovo Pasto
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filtri e Ricerca */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Cerca pasti
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Nome pasto o ingredienti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tipo Pasto
              </label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tutti i tipi</option>
                <option value="breakfast">Colazione</option>
                <option value="lunch">Pranzo</option>
                <option value="dinner">Cena</option>
                <option value="snack">Spuntino</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Lista Pasti */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {filteredMeals.length === 0 ? (
          <Card className="p-12 text-center">
            <HeartIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              {searchTerm || selectedMealType ? 'Nessun pasto trovato' : 'Nessun pasto disponibile'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || selectedMealType 
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Inizia creando il tuo primo pasto personalizzato'
              }
            </p>
            {!searchTerm && !selectedMealType && (
              <Button onClick={handleCreateMeal} variant="primary" className="flex items-center gap-2 mx-auto">
                <PlusIcon className="w-5 h-5" />
                Crea Primo Pasto
              </Button>
            )}
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMeals.map((meal, index) => {
              const IconComponent = mealTypeIcons[meal.type];
              const colorClass = mealTypeColors[meal.type];

              return (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group ${isSelecting ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (isSelecting) {
                      handleSelectMeal(meal.id);
                    }
                  }}
                >
                  <Card
                    className={`p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${
                      selectedMeals.includes(meal.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                    }`}
                  >
                    {isSelecting && (
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          checked={selectedMeals.includes(meal.id)}
                          onChange={() => handleSelectMeal(meal.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {meal.notes || mealTypeLabels[meal.type]}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            {mealTypeLabels[meal.type]}
                          </p>
                        </div>
                      </div>
                      <Badge className={colorClass}>
                        {mealTypeLabels[meal.type]}
                      </Badge>
                    </div>

                    {/* Data */}
                    <div className="text-sm text-neutral-600 mb-4">
                      {new Date(meal.date).toLocaleDateString('it-IT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>

                    {/* Valori nutrizionali */}
                    {meal.calories && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-red-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">
                            {Math.round(meal.calories)}
                          </div>
                          <div className="text-xs text-neutral-600">kcal</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {Math.round(meal.protein || 0)}g
                          </div>
                          <div className="text-xs text-neutral-600">Proteine</div>
                        </div>
                      </div>
                    )}

                    {/* Alimenti */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-700 mb-2">
                        Alimenti ({meal.items.length})
                      </p>
                      <div className="space-y-1">
                        {meal.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-neutral-600">{item.foodName}</span>
                            <span className="text-green-600 font-medium">{item.grams}g</span>
                          </div>
                        ))}
                        {meal.items.length > 2 && (
                          <p className="text-xs text-neutral-500">
                            +{meal.items.length - 2} altri alimenti
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Azioni */}
                    {!isSelecting && (
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMeal(meal);
                          }}
                          variant="secondary"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Modifica
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMeal(meal);
                          }}
                          variant="primary"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Dettagli
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(meal);
                          }}
                          variant="danger"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Elimina
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Modali */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MealCreator
                onMealCreated={handleMealCreated}
                onCancel={handleCloseModals}
              />
            </motion.div>
          </motion.div>
        )}

        {showEditModal && selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MealCreator
                editingMeal={selectedMeal}
                onMealCreated={handleMealUpdated}
                onCancel={handleCloseModals}
              />
            </motion.div>
          </motion.div>
        )}

        {showDetailModal && selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MealDetail
                meal={selectedMeal}
                onClose={handleCloseModals}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealsManagement;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMealsByDate, setSelectedDate, completeMeal, deleteMeal, deleteAllMeals } from '../features/meals/mealsSlice';
import MealCreator from '../components/MealCreator';
import MealDetail from '../components/MealDetail';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  FireIcon,
  HeartIcon,
  BoltIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const MealsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { meals, isLoading, error, selectedDate } = useAppSelector(state => state.meals);
  
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  // Tipi di pasto disponibili
  const mealTypes = [
    { value: 'breakfast', label: 'Colazione', icon: SunIcon, color: 'yellow' },
    { value: 'lunch', label: 'Pranzo', icon: SunIcon, color: 'orange' },
    { value: 'dinner', label: 'Cena', icon: MoonIcon, color: 'blue' },
    { value: 'snack', label: 'Snack', icon: SparklesIcon, color: 'green' }
  ];

  useEffect(() => {
    dispatch(fetchMealsByDate(selectedDate));
  }, [selectedDate, dispatch]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSelectedDate(e.target.value));
  };

  const handleCompleteMeal = async (mealId: string, completed: boolean) => {
    await dispatch(completeMeal({ id: mealId, completed }));
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo pasto?')) {
      await dispatch(deleteMeal(mealId));
    }
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
    if (selectedMeals.length === meals.length) {
      setSelectedMeals([]);
    } else {
      setSelectedMeals(meals.map((meal: any) => meal.id));
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
        dispatch(fetchMealsByDate(selectedDate));
      } catch (error) {
        console.error('Errore durante l\'eliminazione dei pasti:', error);
        alert('Errore durante l\'eliminazione dei pasti');
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
        dispatch(fetchMealsByDate(selectedDate));
      } catch (error) {
        console.error('Errore durante l\'eliminazione di tutti i pasti:', error);
        alert('Errore durante l\'eliminazione di tutti i pasti');
      }
    }
  };

  const handleEditMealById = (mealId: string) => {
    navigate(`/meals/${mealId}/edit`);
  };

  const handleAddNewMeal = () => {
    setSelectedMeal(null);
    setShowCreateModal(true);
  };

  const handleEditMeal = (meal: any) => {
    setSelectedMeal(meal);
    setShowEditModal(true);
  };

  const handleViewMeal = (meal: any) => {
    setSelectedMeal(meal);
    setShowDetailModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedMeal(null);
  };

  const handleMealCreated = (meal: any) => {
    setShowCreateModal(false);
    setSelectedMeal(null);
    dispatch(fetchMealsByDate(selectedDate));
  };

  const handleMealUpdated = (meal: any) => {
    setShowEditModal(false);
    setSelectedMeal(null);
    dispatch(fetchMealsByDate(selectedDate));
  };

  // Filtra i pasti per tipo selezionato
  const filteredMeals = selectedMealType 
    ? meals.filter(meal => meal.type === selectedMealType)
    : meals;

  // Raggruppa i pasti per tipo
  const mealsByType = mealTypes.map(type => ({
    ...type,
    meals: filteredMeals.filter(meal => meal.type === type.value)
  }));

  // Calcola i totali nutrizionali per la data selezionata
  const totalNutrients = meals.reduce((totals, meal) => {
    meal.items.forEach(item => {
      const ratio = item.grams / 100;
      totals.kcal += item.food.per100g.kcal * ratio;
      totals.protein += item.food.per100g.protein * ratio;
      totals.carbs += item.food.per100g.carbs * ratio;
      totals.fats += item.food.per100g.fats * ratio;
    });
    return totals;
  }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block w-12 h-12 border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600 text-lg">Caricamento pasti...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Errore nel caricamento</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button 
            onClick={() => dispatch(fetchMealsByDate(selectedDate))}
            variant="primary"
            className="w-full"
          >
            Riprova
          </Button>
        </motion.div>
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
                <CalendarDaysIcon className="w-8 h-8 text-primary-500" />
                I Miei Pasti
              </h1>
              <p className="text-neutral-600 text-lg">
                Gestisci i tuoi pasti per {new Date(selectedDate).toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-3">
              {isSelecting ? (
                <>
                  <Button
                    onClick={handleSelectAll}
                    variant="secondary"
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    {selectedMeals.length === meals.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    variant="danger"
                    className="flex items-center gap-2 px-6 py-3"
                    disabled={selectedMeals.length === 0}
                  >
                    <TrashIcon className="w-5 h-5" />
                    Elimina Selezionati ({selectedMeals.length})
                  </Button>
                  <Button
                    onClick={handleToggleSelect}
                    variant="ghost"
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    Annulla
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleToggleSelect}
                    variant="secondary"
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Seleziona
                  </Button>
                  <Button
                    onClick={handleDeleteAll}
                    variant="danger"
                    className="flex items-center gap-2 px-6 py-3"
                    disabled={meals.length === 0}
                  >
                    <TrashIcon className="w-5 h-5" />
                    Elimina Tutto
                  </Button>
                  <Button
                    onClick={handleAddNewMeal}
                    variant="primary"
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Nuovo Pasto
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Controlli e Filtri */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tipo Pasto
              </label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tutti i tipi</option>
                {mealTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Riepilogo Nutrizionale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-primary-500" />
            Riepilogo Nutrizionale del Giorno
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {Math.round(totalNutrients.kcal)}
              </div>
              <div className="text-sm text-neutral-600">kcal</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(totalNutrients.protein)}g
              </div>
              <div className="text-sm text-neutral-600">Proteine</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {Math.round(totalNutrients.carbs)}g
              </div>
              <div className="text-sm text-neutral-600">Carboidrati</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(totalNutrients.fats)}g
              </div>
              <div className="text-sm text-neutral-600">Grassi</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Lista Pasti per Tipo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-8"
      >
        {mealsByType.map((type, typeIndex) => (
          <motion.div
            key={type.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: typeIndex * 0.1 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2 flex items-center gap-3">
                <type.icon className={`w-6 h-6 text-${type.color}-500`} />
                {type.label}
                <Badge variant="secondary" className="text-sm">
                  {type.meals.length} pasti
                </Badge>
              </h2>
            </div>
            
            {type.meals.length === 0 ? (
              <Card className="p-8 text-center">
                <div className={`w-16 h-16 bg-${type.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <type.icon className={`w-8 h-8 text-${type.color}-600`} />
                </div>
                <p className="text-neutral-600 mb-4">
                  Nessun pasto pianificato per {type.label.toLowerCase()}
                </p>
                <Button
                  onClick={() => navigate('/meals/new', { state: { mealType: type.value, date: selectedDate } })}
                  variant="primary"
                  className="flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="w-4 h-4" />
                  Aggiungi {type.label}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {type.meals.map((meal, mealIndex) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: mealIndex * 0.1 }}
                  >
                    <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${
                      meal.completed ? 'bg-green-50 border-green-200' : 'hover:-translate-y-1'
                    }`}>
                      {/* Header del pasto */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                            {meal.notes || `${type.label} del ${new Date(meal.date).toLocaleDateString('it-IT')}`}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {meal.items.length} alimenti • {Math.round(meal.items.reduce((sum, item) => sum + (item.food.per100g.kcal * item.grams / 100), 0))} kcal
                          </p>
                        </div>
                        
                        {/* Stato completamento */}
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={meal.completed}
                              onChange={(e) => handleCompleteMeal(meal.id, e.target.checked)}
                              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                            />
                            <span className={`text-sm font-medium ${
                              meal.completed ? 'text-green-600' : 'text-neutral-600'
                            }`}>
                              {meal.completed ? 'Completato' : 'Da completare'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Lista alimenti */}
                      <div className="space-y-2 mb-4">
                        {meal.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {item.food.name}
                              </p>
                              {item.food.brand && (
                                <p className="text-xs text-neutral-500">
                                  {item.food.brand}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">
                                {item.grams}g
                              </p>
                              <p className="text-xs text-neutral-500">
                                {Math.round(item.food.per100g.kcal * item.grams / 100)} kcal
                              </p>
                            </div>
                          </div>
                        ))}
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
                              handleDeleteMeal(meal.id);
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

                      {/* Timestamp completamento */}
                      {meal.completed && meal.completedAt && (
                        <div className="mt-4 p-2 bg-green-100 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 text-sm">
                            <CheckCircleIcon className="w-4 h-4" />
                            Completato alle {new Date(meal.completedAt).toLocaleTimeString('it-IT', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Messaggio se non ci sono pasti */}
      {meals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDaysIcon className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
              Nessun pasto pianificato
            </h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Inizia a pianificare i tuoi pasti per {new Date(selectedDate).toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <Button
              onClick={handleAddNewMeal}
              variant="primary"
              className="flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="w-5 h-5" />
              Pianifica il Primo Pasto
            </Button>
          </Card>
        </motion.div>
      )}

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

export default MealsList;
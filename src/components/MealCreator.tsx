import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchFoods } from '../features/foods/foodsSlice';
import { createMeal, updateMeal } from '../features/meals/mealsSlice';
import type { Food, Meal, MealItem } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  FireIcon,
  HeartIcon,
  CalendarDaysIcon,
  ClockIcon,
  CalendarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

interface MealCreatorProps {
  onMealCreated: (meal: Meal) => void;
  editingMeal?: Meal | null;
  onCancel?: () => void;
}

const MealCreator: React.FC<MealCreatorProps> = ({ onMealCreated, editingMeal, onCancel }) => {
  const dispatch = useAppDispatch();
  const { foods } = useAppSelector(state => state.foods);
  
  const [mealName, setMealName] = useState('');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<Array<{ food: Food; grams: number }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Nuovi stati per le opzioni di creazione
  const [creationMode, setCreationMode] = useState<'assign' | 'catalog'>('assign');
  const [hasDate, setHasDate] = useState(true);
  const [hasRepetition, setHasRepetition] = useState(false);
  const [repetitionType, setRepetitionType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [repetitionEndDate, setRepetitionEndDate] = useState('');

  const mealTypeLabels = {
    breakfast: 'Colazione',
    lunch: 'Pranzo',
    dinner: 'Cena',
    snack: 'Spuntino'
  };


  useEffect(() => {
    dispatch(fetchFoods());
  }, [dispatch]);

  // Gestisce la chiusura con il tasto Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Previene lo scroll del body quando la modale è aperta
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onCancel]);

  // Inizializza i campi quando si sta modificando un pasto
  useEffect(() => {
    if (editingMeal) {
      setMealName(editingMeal.notes || '');
      setMealDate(editingMeal.date);
      setMealType(editingMeal.type);
      setSelectedFoods(editingMeal.items.map(item => ({
        food: item.food || { id: item.foodId, name: item.foodName } as Food,
        grams: item.grams
      })));
    }
  }, [editingMeal]);

  const filteredFoods = foods?.filter((food: Food) => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const addFoodToMeal = (food: Food) => {
    const existingIndex = selectedFoods.findIndex(item => item.food.id === food.id);
    if (existingIndex >= 0) {
      const updated = [...selectedFoods];
      updated[existingIndex].grams += 50; // Aggiungi 50g se già presente
      setSelectedFoods(updated);
    } else {
      setSelectedFoods([...selectedFoods, { food, grams: 100 }]);
    }
  };

  const removeFoodFromMeal = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter(item => item.food.id !== foodId));
  };

  const updateFoodGrams = (foodId: string, grams: number) => {
    setSelectedFoods(selectedFoods.map(item => 
      item.food.id === foodId ? { ...item, grams: Math.max(0, grams) } : item
    ));
  };

  const calculateTotalNutrition = () => {
    return selectedFoods.reduce((totals, item) => {
      const ratio = item.grams / 100;
      totals.calories += item.food.per100g.kcal * ratio;
      totals.protein += item.food.per100g.protein * ratio;
      totals.carbs += item.food.per100g.carbs * ratio;
      totals.fat += item.food.per100g.fats * ratio;
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFoods.length === 0) {
      alert('Aggiungi almeno un alimento al pasto');
      return;
    }

    setIsCreating(true);
    try {
      const totalNutrition = calculateTotalNutrition();
      const mealItems: MealItem[] = selectedFoods.map(item => ({
        foodId: item.food.id,
        foodName: item.food.name,
        food: item.food,
        grams: item.grams
      }));

      const mealData = {
        date: creationMode === 'assign' && hasDate ? mealDate : (creationMode === 'catalog' ? '' : mealDate),
        type: mealType,
        notes: mealName || `${mealTypeLabels[mealType]}${hasDate ? ` del ${new Date(mealDate).toLocaleDateString('it-IT')}` : ''}`,
        items: mealItems,
        calories: Math.round(totalNutrition.calories),
        protein: Math.round(totalNutrition.protein * 10) / 10,
        carbs: Math.round(totalNutrition.carbs * 10) / 10,
        fat: Math.round(totalNutrition.fat * 10) / 10,
        // Nuovi campi per le opzioni di creazione
        creationMode,
        hasRepetition,
        repetitionType: hasRepetition ? repetitionType : undefined,
        repetitionEndDate: hasRepetition ? repetitionEndDate : undefined
      };

      let result;
      if (editingMeal) {
        result = await dispatch(updateMeal({ id: editingMeal.id, mealData })).unwrap();
      } else {
        const newMealData = {
          ...mealData,
          userId: 'user-1',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        result = await dispatch(createMeal(newMealData)).unwrap();
      }

      onMealCreated(result);
      
      // Reset form
      setMealName('');
      setMealDate(new Date().toISOString().split('T')[0]);
      setMealType('breakfast');
      setSelectedFoods([]);
      setSearchTerm('');
      setCreationMode('assign');
      setHasDate(true);
      setHasRepetition(false);
      setRepetitionType('daily');
      setRepetitionEndDate('');
    } catch (error) {
      console.error('Errore nella creazione/modifica del pasto:', error);
      alert('Errore nella creazione del pasto');
    } finally {
      setIsCreating(false);
    }
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingMeal ? 'Modifica Pasto' : 'Crea Nuovo Pasto'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-20">
              {/* Informazioni Base */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-primary-500" />
                  Informazioni Base
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Pasto
                    </label>
                    <Input
                      type="text"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      placeholder="Es. Pranzo leggero"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <Input
                      type="date"
                      value={mealDate}
                      onChange={(e) => setMealDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo Pasto
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Object.entries(mealTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Opzioni di Creazione */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary-500" />
                  Opzioni di Creazione
                </h3>
                
                <div className="space-y-4">
                  {/* Modalità di creazione */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Come vuoi creare questo pasto?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCreationMode('assign')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          creationMode === 'assign'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="w-5 h-5" />
                          <span className="font-medium">Assegna a Data</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Crea il pasto per una data specifica
                        </p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCreationMode('catalog')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          creationMode === 'catalog'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpenIcon className="w-5 h-5" />
                          <span className="font-medium">Salva nel Catalogo</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Crea il pasto senza data specifica
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Opzioni per assegnazione a data */}
                  {creationMode === 'assign' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasDate"
                          checked={hasDate}
                          onChange={(e) => setHasDate(e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="hasDate" className="text-sm font-medium text-gray-700">
                          Assegna a una data specifica
                        </label>
                      </div>
                      
                      {hasDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data
                          </label>
                          <Input
                            type="date"
                            value={mealDate}
                            onChange={(e) => setMealDate(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasRepetition"
                          checked={hasRepetition}
                          onChange={(e) => setHasRepetition(e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="hasRepetition" className="text-sm font-medium text-gray-700">
                          Ripeti questo pasto
                        </label>
                      </div>
                      
                      {hasRepetition && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo di ripetizione
                            </label>
                            <select
                              value={repetitionType}
                              onChange={(e) => setRepetitionType(e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="daily">Giornaliera</option>
                              <option value="weekly">Settimanale</option>
                              <option value="monthly">Mensile</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fino al
                            </label>
                            <Input
                              type="date"
                              value={repetitionEndDate}
                              onChange={(e) => setRepetitionEndDate(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informazioni per catalogo */}
                  {creationMode === 'catalog' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <BookOpenIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">
                            Pasto salvato nel catalogo
                          </h4>
                          <p className="text-sm text-blue-700">
                            Questo pasto sarà disponibile nel catalogo per essere assegnato a date future.
                            Potrai modificarlo o assegnarlo quando necessario.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Alimenti Selezionati */}
              {selectedFoods.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HeartIcon className="w-5 h-5 text-primary-500" />
                    Alimenti Selezionati ({selectedFoods.length})
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedFoods.map((item) => (
                      <motion.div
                        key={item.food.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.food.name}</h4>
                          {item.food.brand && (
                            <p className="text-sm text-gray-600">{item.food.brand}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Grammi:</label>
                            <Input
                              type="number"
                              value={item.grams}
                              onChange={(e) => updateFoodGrams(item.food.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                              min="0"
                            />
                          </div>
                          
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeFoodFromMeal(item.food.id)}
                            className="p-2"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Riepilogo Nutrizionale */}
              {selectedFoods.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FireIcon className="w-5 h-5 text-primary-500" />
                    Riepilogo Nutrizionale
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round(totalNutrition.calories)}
                      </div>
                      <div className="text-sm text-gray-600">Calorie</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(totalNutrition.protein * 10) / 10}g
                      </div>
                      <div className="text-sm text-gray-600">Proteine</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">
                        {Math.round(totalNutrition.carbs * 10) / 10}g
                      </div>
                      <div className="text-sm text-gray-600">Carboidrati</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(totalNutrition.fat * 10) / 10}g
                      </div>
                      <div className="text-sm text-gray-600">Grassi</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Ricerca Alimenti */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-primary-500" />
                  Aggiungi Alimenti
                </h3>
                
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Cerca alimenti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {filteredFoods.map((food) => (
                    <motion.div
                      key={food.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addFoodToMeal(food)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{food.name}</h4>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="p-1"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </Button>
                        </div>
                        {food.brand && (
                          <p className="text-xs text-gray-600 mb-2">{food.brand}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{food.per100g.kcal} kcal</span>
                          <span>P: {food.per100g.protein}g</span>
                          <span>C: {food.per100g.carbs}g</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={isCreating || selectedFoods.length === 0}
              className="flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {editingMeal ? 'Modificando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  {editingMeal 
                    ? 'Modifica Pasto' 
                    : creationMode === 'assign' 
                      ? 'Crea e Assegna Pasto' 
                      : 'Salva nel Catalogo'
                  }
                </>
              )}
            </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default MealCreator;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchFoods, createFood, deleteFood, deleteAllFoods } from '../features/foods/foodsSlice';
import type { Food } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import FoodForm from './FoodForm';
import FoodDetail from '../components/FoodDetail';
import BarcodeScanner from '../components/BarcodeScanner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  PlusIcon, 
  PencilIcon, 
  EyeIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  QrCodeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const FoodsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { foods, isLoading, error } = useAppSelector((state: any) => state.foods as any);
  const { user } = useAppSelector((state: any) => state.auth as any);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    dispatch(fetchFoods());
  }, [dispatch]);

  const handleCreateFood = () => {
    setSelectedFood(null);
    setShowCreateModal(true);
  };

  const handleEditFood = (food: Food) => {
    setSelectedFood(food);
    setShowEditModal(true);
  };

  const handleViewFood = (food: Food) => {
    setSelectedFood(food);
    setShowDetailModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowBarcodeScanner(false);
    setSelectedFood(null);
  };

  const handleToggleSelect = () => {
    setIsSelecting(!isSelecting);
    setSelectedFoods([]);
  };

  const handleSelectFood = (foodId: string) => {
    setSelectedFoods(prev => 
      prev.includes(foodId) 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFoods.length === foods.length) {
      setSelectedFoods([]);
    } else {
      setSelectedFoods(foods.map((food: Food) => food.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFoods.length === 0) return;
    
    if (window.confirm(`Sei sicuro di voler eliminare ${selectedFoods.length} alimenti selezionati?`)) {
      try {
        for (const foodId of selectedFoods) {
          await dispatch(deleteFood(foodId)).unwrap();
        }
        setSelectedFoods([]);
        setIsSelecting(false);
        dispatch(fetchFoods());
      } catch (error) {
        console.error('Errore durante l\'eliminazione degli alimenti:', error);
        alert('Errore durante l\'eliminazione degli alimenti');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (foods.length === 0) return;
    
    if (window.confirm(`Sei sicuro di voler eliminare TUTTI gli ${foods.length} alimenti? Questa azione non può essere annullata.`)) {
      try {
        await dispatch(deleteAllFoods()).unwrap();
        setSelectedFoods([]);
        setIsSelecting(false);
        dispatch(fetchFoods());
      } catch (error) {
        console.error('Errore durante l\'eliminazione di tutti gli alimenti:', error);
        alert('Errore durante l\'eliminazione di tutti gli alimenti');
      }
    }
  };

  const handleFoodFound = async (foodData: Omit<Food, 'id'>) => {
    try {
      await dispatch(createFood(foodData)).unwrap();
      console.log(`Alimento "${foodData.name}" aggiunto con successo tramite barcode scanner`);
      alert(`Alimento "${foodData.name}" aggiunto con successo!`);
      setShowBarcodeScanner(false);
      // Ricarica la lista
      dispatch(fetchFoods());
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'alimento:', error);
      alert('Errore durante l\'aggiunta dell\'alimento');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block w-12 h-12 border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600 text-lg">Caricamento alimenti...</p>
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
            onClick={() => dispatch(fetchFoods())}
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
                <HeartIcon className="w-8 h-8 text-primary-500" />
                Catalogo Alimenti
              </h1>
              <p className="text-neutral-600 text-lg">
                Scopri e gestisci la tua collezione di alimenti nutrizionali
              </p>
              <div className="mt-2">
                <Badge variant="info" className="text-sm">
                  {foods.length} alimenti disponibili
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              {isSelecting ? (
                <>
                  <Button
                    onClick={handleSelectAll}
                    variant="secondary"
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    {selectedFoods.length === foods.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    variant="danger"
                    className="flex items-center gap-2 px-6 py-3"
                    disabled={selectedFoods.length === 0}
                  >
                    <TrashIcon className="w-5 h-5" />
                    Elimina Selezionati ({selectedFoods.length})
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
                    disabled={foods.length === 0}
                  >
                    <TrashIcon className="w-5 h-5" />
                    Elimina Tutto
                  </Button>
                  <Button
                    onClick={() => setShowBarcodeScanner(true)}
                    variant="secondary"
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    <QrCodeIcon className="w-5 h-5" />
                    Scanner
                  </Button>
                  <Button
                    onClick={handleCreateFood}
                    variant="primary"
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Nuovo Alimento
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {foods.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
              Nessun alimento trovato
            </h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Inizia aggiungendo il tuo primo alimento al catalogo per iniziare a tracciare la tua nutrizione.
            </p>
            <Button
              onClick={handleCreateFood}
              variant="primary"
              className="flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="w-5 h-5" />
              Aggiungi Primo Alimento
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {foods.map((food: Food, index: number) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${
                  selectedFoods.includes(food.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => {
                  if (isSelecting) {
                    handleSelectFood(food.id);
                  } else {
                    handleViewFood(food);
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {isSelecting && (
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectedFoods.includes(food.id)}
                          onChange={() => handleSelectFood(food.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {food.name}
                    </h3>
                    {food.brand && (
                      <p className="text-sm text-neutral-500 mb-2">
                        {food.brand}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {food.category}
                    </Badge>
                  </div>
                </div>
                
                {/* Valori Nutrizionali */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <FireIcon className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {food.per100g.kcal}
                    </div>
                    <div className="text-xs text-neutral-600">kcal</div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <HeartIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {food.per100g.protein}g
                    </div>
                    <div className="text-xs text-neutral-600">Proteine</div>
                  </div>
                  
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <BoltIcon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-lg font-bold text-amber-600">
                      {food.per100g.carbs}g
                    </div>
                    <div className="text-xs text-neutral-600">Carboidrati</div>
                  </div>
                </div>

                {/* Azioni */}
                {!isSelecting && (
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFood(food);
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
                        handleViewFood(food);
                      }}
                      variant="primary"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Dettagli
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
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
              <FoodForm
                food={null}
                onClose={handleCloseModals}
                onSuccess={() => {
                  handleCloseModals();
                  dispatch(fetchFoods());
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {showEditModal && selectedFood && (
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
              <FoodForm
                food={selectedFood}
                onClose={handleCloseModals}
                onSuccess={() => {
                  handleCloseModals();
                  dispatch(fetchFoods());
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {showDetailModal && selectedFood && (
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
              <FoodDetail
                food={selectedFood}
                onClose={handleCloseModals}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Barcode Scanner Modal */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onFoodFound={handleFoodFound}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodsList;
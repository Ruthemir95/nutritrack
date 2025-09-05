import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchFoods, deleteFood, createFood } from '../features/foods/foodsSlice';
import CsvImporter from '../components/CsvImporter';
import BarcodeScanner from '../components/BarcodeScanner';
import type { Food } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  Cog6ToothIcon, 
  HeartIcon, 
  ChartBarIcon, 
  DocumentArrowUpIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { foods, isLoading } = useAppSelector((state: any) => state.foods as any);
  const { user } = useAppSelector((state: any) => state.auth as any);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'foods' | 'import' | 'users'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  useEffect(() => {
    dispatch(fetchFoods());
  }, [dispatch]);

  // Filtri per alimenti
  const filteredFoods = foods?.filter((food: Food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Categorie uniche
  const categories = ['all', ...Array.from(new Set(foods?.map((food: Food) => food.category) || []))];

  // Statistiche
  const totalFoods = foods?.length || 0;
  const totalCategories = categories.length - 1; // -1 per escludere 'all'
  const avgCalories = foods?.length > 0 ? 
    Math.round(foods.reduce((sum: number, food: Food) => sum + food.per100g.kcal, 0) / foods.length) : 0;

  // Gestione eliminazione alimento
  const handleDeleteFood = async (foodId: string, foodName: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare "${foodName}"?`)) {
      try {
        await dispatch(deleteFood(foodId)).unwrap();
        // Ricarica la lista
        dispatch(fetchFoods());
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
        alert('Errore nell\'eliminazione dell\'alimento');
      }
    }
  };

  // Gestione alimento trovato tramite barcode scanner
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

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: ChartBarIcon },
    { id: 'foods', label: 'Alimenti', icon: HeartIcon },
    { id: 'import', label: 'Import CSV', icon: DocumentArrowUpIcon },
    { id: 'catalog', label: 'Gestione Catalogo', icon: Cog6ToothIcon },
    { id: 'users', label: 'Utenti', icon: UserGroupIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block w-12 h-12 border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600 text-lg">Caricamento pannello admin...</p>
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
                <Cog6ToothIcon className="w-8 h-8 text-primary-500" />
                Pannello Amministratore
              </h1>
              <p className="text-neutral-600 text-lg">
                Gestisci alimenti, importa dati e amministra il sistema
              </p>
            </div>
            <Badge variant="info" className="text-sm">
              Ruolo: {user?.role || 'Admin'}
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistiche */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalFoods}</div>
                <div className="text-sm text-neutral-600">Alimenti Totali</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{totalCategories}</div>
                <div className="text-sm text-neutral-600">Categorie</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">{avgCalories}</div>
                <div className="text-sm text-neutral-600">Calorie Medie</div>
              </Card>
            </div>

            {/* Azioni Rapide */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Azioni Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveTab('foods')}
                  variant="secondary"
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <HeartIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Gestisci Alimenti</div>
                    <div className="text-sm text-neutral-600">Aggiungi, modifica, elimina</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setActiveTab('import')}
                  variant="secondary"
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Importa CSV</div>
                    <div className="text-sm text-neutral-600">Carica dati in bulk</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setActiveTab('users')}
                  variant="secondary"
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <UserGroupIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Gestione Utenti</div>
                    <div className="text-sm text-neutral-600">Amministra accessi</div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'foods' && (
          <div className="space-y-6">
            {/* Filtri */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Cerca alimenti
                  </label>
                  <input
                    type="text"
                    placeholder="Nome alimento o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'Tutte le categorie' : cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={() => setShowBarcodeScanner(true)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    📱 Scanner
                  </Button>
                  <Button
                    onClick={() => navigate('/foods/new')}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Nuovo Alimento
                  </Button>
                </div>
              </div>
            </Card>

            {/* Lista Alimenti */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoods.map((food: Food, index: number) => (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
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
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/foods/${food.id}/edit`)}
                        variant="secondary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Modifica
                      </Button>
                      <Button
                        onClick={() => navigate(`/foods/${food.id}`)}
                        variant="primary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Dettagli
                      </Button>
                      <Button
                        onClick={() => handleDeleteFood(food.id, food.name)}
                        variant="danger"
                        size="sm"
                        className="flex items-center justify-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Importa Dati CSV</h3>
            <CsvImporter />
          </Card>
        )}

        {activeTab === 'users' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Gestione Utenti</h3>
            <div className="text-center py-12">
              <UserGroupIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">Funzionalità di gestione utenti in arrivo...</p>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onFoodFound={handleFoodFound}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
};

export default Admin;
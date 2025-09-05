import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMeals, completeMeal, deleteMeal } from '../features/meals/mealsSlice';
import { fetchFoods } from '../features/foods/foodsSlice';
import MealCreator from '../components/MealCreator';
import MealDetail from '../components/MealDetail';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { Meal } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  FireIcon, 
  HeartIcon, 
  BoltIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface DailyStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  meals: number;
}

interface MacroDistribution {
  name: string;
  value: number;
  color: string;
}

const Dashboard: React.FC = () => {
  console.log('Dashboard component rendering...');
  const dispatch = useAppDispatch();
  const { meals, isLoading: mealsLoading } = useAppSelector((state: any) => state.meals as any);
  const { foods, isLoading: foodsLoading } = useAppSelector((state: any) => state.foods as any);
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'today' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(new Date());
  const [showMealCreator, setShowMealCreator] = useState(false);
  const [showMealDetail, setShowMealDetail] = useState(false);
  const [showMealEdit, setShowMealEdit] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  // Timeout per evitare caricamento infinito
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 secondi di timeout
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('Dashboard useEffect - fetching data...');
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchMeals()).unwrap(),
          dispatch(fetchFoods()).unwrap()
        ]);
        console.log('Data fetched successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
        console.log('Using mock data due to connection error');
      }
    };
    fetchData();
  }, [dispatch]);

  // Aggiorna i pasti quando si torna alla Dashboard (per sincronizzazione con altre pagine)
  useEffect(() => {
    const handleFocus = () => {
      dispatch(fetchMeals());
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);

  console.log('Dashboard state:', { meals, mealsLoading, foods, foodsLoading });

  // Funzioni per filtrare i pasti in base al periodo selezionato
  const getFilteredMeals = () => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        return meals.filter((meal: Meal) => meal.date === today);
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return meals.filter((meal: Meal) => {
          const mealDate = new Date(meal.date);
          return mealDate >= weekAgo && mealDate <= now;
        });
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return meals.filter((meal: Meal) => {
          const mealDate = new Date(meal.date);
          return mealDate >= monthAgo && mealDate <= now;
        });
      
      case 'custom':
        const customDateStr = customDate.toISOString().split('T')[0];
        return meals.filter((meal: Meal) => meal.date === customDateStr);
      
      default:
        return getTodayMeals();
    }
  };

  const getTodayMeals = () => {
    const today = new Date().toISOString().split('T')[0];
    return meals.filter((meal: Meal) => meal.date === today);
  };

  const getFilteredStats = () => {
    const filteredMeals = getFilteredMeals();
    const totalCalories = filteredMeals.reduce((sum: number, meal: Meal) => sum + (meal.calories || 0), 0);
    const completedMeals = filteredMeals.filter((meal: Meal) => meal.completed).length;
    const totalMeals = filteredMeals.length;
    
    return {
      totalCalories,
      completedMeals,
      totalMeals,
      completionRate: totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0
    };
  };


  const getChartData = () => {
    const now = new Date();
    let daysToShow = 7; // Default per settimana
    
    if (selectedPeriod === 'month') {
      daysToShow = 30;
    } else if (selectedPeriod === 'custom') {
      // Per data personalizzata, mostra solo quel giorno
      daysToShow = 1;
    }
    
    const dailyStats: DailyStats[] = [];
    const startDate = selectedPeriod === 'custom' 
      ? customDate 
      : new Date(now.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayMeals = meals.filter((meal: Meal) => meal.date === dateStr);
      
      const totalCalories = dayMeals.reduce((sum: number, meal: Meal) => sum + (meal.calories || 0), 0);
      const totalProtein = dayMeals.reduce((sum: number, meal: Meal) => sum + (meal.protein || 0), 0);
      const totalCarbs = dayMeals.reduce((sum: number, meal: Meal) => sum + (meal.carbs || 0), 0);
      const totalFats = dayMeals.reduce((sum: number, meal: Meal) => sum + (meal.fat || 0), 0);
      const totalFiber = dayMeals.reduce((sum: number, meal: Meal) => sum + (meal.fiber || 0), 0);
      
      dailyStats.push({
        date: dateStr,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        fiber: totalFiber,
        meals: dayMeals.length
      });
    }
    
    return dailyStats;
  };


  const getMacroDistribution = (): MacroDistribution[] => {
    const filteredMeals = getFilteredMeals();
    const totalProtein = filteredMeals.reduce((sum: number, meal: Meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = filteredMeals.reduce((sum: number, meal: Meal) => sum + (meal.carbs || 0), 0);
    const totalFats = filteredMeals.reduce((sum: number, meal: Meal) => sum + (meal.fat || 0), 0);
    
    return [
      { name: 'Proteine', value: totalProtein, color: '#3B82F6' },
      { name: 'Carboidrati', value: totalCarbs, color: '#10B981' },
      { name: 'Grassi', value: totalFats, color: '#F59E0B' }
    ];
  };

  const handleToggleMealComplete = async (meal: Meal) => {
    try {
      await dispatch(completeMeal({ id: meal.id, completed: !meal.completed })).unwrap();
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del pasto:', error);
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowMealEdit(true);
  };

  const handleDeleteMeal = async (meal: Meal) => {
    if (window.confirm('Sei sicuro di voler eliminare questo pasto?')) {
      try {
        await dispatch(deleteMeal(meal.id)).unwrap();
      } catch (error) {
        console.error('Errore durante l\'eliminazione del pasto:', error);
      }
    }
  };

  const handleViewMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowMealDetail(true);
  };

  const handleCloseModals = () => {
    setShowMealCreator(false);
    setShowMealDetail(false);
    setShowMealEdit(false);
    setSelectedMeal(null);
  };

  const handleMealUpdated = () => {
    handleCloseModals();
    dispatch(fetchMeals());
  };

  const getMealTypeIcon = (type: string) => {
    const icons = {
      breakfast: SunIcon,
      lunch: SunIcon,
      dinner: MoonIcon,
      snack: SparklesIcon
    };
    return icons[type as keyof typeof icons] || ClockIcon;
  };

  const getMealTypeColor = (type: string) => {
    const colors = {
      breakfast: 'from-amber-50 to-orange-50 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50',
      lunch: 'from-blue-50 to-indigo-50 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50',
      dinner: 'from-purple-50 to-pink-50 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50',
      snack: 'from-emerald-50 to-teal-50 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'
    };
    return colors[type as keyof typeof colors] || 'from-gray-50 to-slate-50 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50';
  };

  const getMealTypeLabel = (type: string) => {
    const labels = {
      breakfast: 'Colazione',
      lunch: 'Pranzo',
      dinner: 'Cena',
      snack: 'Spuntino'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if ((mealsLoading || foodsLoading) && !loadingTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block w-12 h-12 border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600 text-lg">Caricamento dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Se non ci sono dati e il timeout è scaduto, mostra un messaggio di errore
  if (loadingTimeout && (!meals || meals.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Errore di connessione</h3>
          <p className="text-gray-600 mb-6">Impossibile connettersi al server. Verifica che il server JSON sia attivo.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Riprova
          </Button>
        </motion.div>
      </div>
    );
  }

  // Calcola i dati filtrati ogni volta che cambia il periodo o i pasti
  const filteredMeals = React.useMemo(() => {
    console.log('Recalculating filteredMeals for period:', selectedPeriod);
    return getFilteredMeals();
  }, [selectedPeriod, customDate, meals]);
  
  const filteredStats = React.useMemo(() => {
    console.log('Recalculating filteredStats for period:', selectedPeriod);
    return getFilteredStats();
  }, [selectedPeriod, customDate, meals]);
  
  const chartData = React.useMemo(() => {
    console.log('Recalculating chartData for period:', selectedPeriod);
    return getChartData();
  }, [selectedPeriod, customDate, meals]);
  
  const macroDistribution = React.useMemo(() => {
    console.log('Recalculating macroDistribution for period:', selectedPeriod);
    return getMacroDistribution();
  }, [selectedPeriod, customDate, meals]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 md:p-8 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Benvenuto nella tua dashboard nutrizionale
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowMealCreator(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Aggiungi Pasto
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Selettore Periodo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Periodo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Oggi' },
                { key: 'week', label: 'Settimana' },
                { key: 'month', label: 'Mese' },
                { key: 'custom', label: 'Personalizzato' }
              ].map((period) => (
                <Button
                  key={period.key}
                  onClick={() => {
                    console.log('Clicked period:', period.key);
                    setSelectedPeriod(period.key as any);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    selectedPeriod === period.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </Button>
              ))}
            </div>
            {selectedPeriod === 'custom' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Data:</label>
                <input
                  type="date"
                  value={customDate.toISOString().split('T')[0]}
                  onChange={(e) => setCustomDate(new Date(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Pasti del Periodo Selezionato - SEMPRE PRIMA SEZIONE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-xl">
                <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPeriod === 'today' && 'Pasti di Oggi'}
                  {selectedPeriod === 'week' && 'Pasti della Settimana'}
                  {selectedPeriod === 'month' && 'Pasti del Mese'}
                  {selectedPeriod === 'custom' && `Pasti del ${customDate.toLocaleDateString('it-IT')}`}
                </h2>
                <p className="text-gray-600">
                  {filteredStats.totalMeals} pasti programmati • {filteredStats.completedMeals} completati
                </p>
              </div>
            </div>
            <Badge
              className={`px-4 py-2 text-sm font-medium rounded-xl ${
                filteredStats.completionRate === 100
                  ? 'bg-green-100 text-green-800'
                  : filteredStats.completionRate >= 50
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {filteredStats.completionRate.toFixed(0)}% completato
            </Badge>
          </div>

          {filteredMeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedPeriod === 'today' && 'Nessun pasto programmato per oggi'}
                {selectedPeriod === 'week' && 'Nessun pasto programmato questa settimana'}
                {selectedPeriod === 'month' && 'Nessun pasto programmato questo mese'}
                {selectedPeriod === 'custom' && `Nessun pasto programmato per il ${customDate.toLocaleDateString('it-IT')}`}
              </h3>
              <p className="text-gray-600 mb-6">Inizia aggiungendo il tuo primo pasto</p>
              <Button
                onClick={() => setShowMealCreator(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
              >
                Aggiungi Pasto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeals.map((meal: Meal) => {
                const IconComponent = getMealTypeIcon(meal.type);
                const colorClass = getMealTypeColor(meal.type);
                const typeLabel = getMealTypeLabel(meal.type);

                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border-2 ${colorClass} ${
                      meal.completed ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{typeLabel}</h3>
                            <p className="text-sm text-gray-600">
                              {meal.items?.length || 0} alimenti • {meal.calories || 0} kcal
                            </p>
                          </div>
                        </div>
                        {meal.completed && (
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleToggleMealComplete(meal)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium ${
                            meal.completed
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {meal.completed ? 'Completato' : 'Completa'}
                        </Button>
                        <Button
                          onClick={() => handleViewMeal(meal)}
                          className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditMeal(meal)}
                          className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteMeal(meal)}
                          className="p-3 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-xl"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Statistiche del Periodo Selezionato */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedPeriod === 'today' && 'Statistiche di Oggi'}
            {selectedPeriod === 'week' && 'Statistiche della Settimana'}
            {selectedPeriod === 'month' && 'Statistiche del Mese'}
            {selectedPeriod === 'custom' && `Statistiche del ${customDate.toLocaleDateString('it-IT')}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FireIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{filteredStats.totalCalories}</h3>
              <p className="text-gray-600">Calorie</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <HeartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{filteredStats.completedMeals}</h3>
              <p className="text-gray-600">Pasti Completati</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BoltIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{filteredStats.totalMeals}</h3>
              <p className="text-gray-600">Pasti Totali</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{filteredStats.completionRate.toFixed(0)}%</h3>
              <p className="text-gray-600">Completamento</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico Calorie del Periodo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedPeriod === 'today' && 'Calorie di Oggi'}
              {selectedPeriod === 'week' && 'Calorie Settimanali'}
              {selectedPeriod === 'month' && 'Calorie Mensili'}
              {selectedPeriod === 'custom' && `Calorie del ${customDate.toLocaleDateString('it-IT')}`}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    if (selectedPeriod === 'month') {
                      return new Date(value).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
                    } else if (selectedPeriod === 'custom') {
                      return new Date(value).toLocaleDateString('it-IT', { weekday: 'short' });
                    } else {
                      return new Date(value).toLocaleDateString('it-IT', { weekday: 'short' });
                    }
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('it-IT')}
                  formatter={(value) => [`${value} kcal`, 'Calorie']}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Distribuzione Macros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Distribuzione Macros</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={macroDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}g`, 'Quantità']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Grafico Pasti per Giorno */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {selectedPeriod === 'today' && 'Pasti di Oggi'}
            {selectedPeriod === 'week' && 'Pasti per Giorno (Settimana)'}
            {selectedPeriod === 'month' && 'Pasti per Giorno (Mese)'}
            {selectedPeriod === 'custom' && `Pasti del ${customDate.toLocaleDateString('it-IT')}`}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  if (selectedPeriod === 'month') {
                    return new Date(value).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
                  } else if (selectedPeriod === 'custom') {
                    return new Date(value).toLocaleDateString('it-IT', { weekday: 'short' });
                  } else {
                    return new Date(value).toLocaleDateString('it-IT', { weekday: 'short' });
                  }
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('it-IT')}
                formatter={(value) => [`${value}`, 'Pasti']}
              />
              <Bar dataKey="meals" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Modali */}
      <AnimatePresence>
        {showMealCreator && (
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
                onMealCreated={handleMealUpdated}
                onCancel={handleCloseModals}
              />
            </motion.div>
          </motion.div>
        )}

        {showMealEdit && selectedMeal && (
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

        {showMealDetail && selectedMeal && (
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

export default Dashboard;
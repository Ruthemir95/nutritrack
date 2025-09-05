import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAllMeals, updateMeal, deleteMeal } from '../features/meals/mealsSlice';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  FireIcon, 
  HeartIcon, 
  BoltIcon,
  CheckCircleIcon,
  CircleStackIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Meal {
  id: string;
  date: string;
  type: string;
  completed: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: Array<{
    food: {
      per100g: {
        kcal: number;
        protein: number;
        carbs: number;
        fats: number;
      };
    };
    grams: number;
  }>;
}

interface ChartData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
}

const AdvancedDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { meals, isLoading } = useAppSelector((state: any) => state.meals);
  
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'today' | 'custom'>('week');
  const [selectedChart, setSelectedChart] = useState('calories');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAllMeals());
  }, [dispatch]);

  // Log per debug
  useEffect(() => {
    console.log('Meals updated in dashboard:', meals?.length || 0, 'meals');
  }, [meals]);

  // Filtra i pasti in base al filtro temporale
  const filteredMeals = useMemo(() => {
    if (!meals || meals.length === 0) return [];

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (timeFilter) {
      case 'today':
        return meals.filter((meal: Meal) => meal.date === today);
      
      case 'custom':
        return meals.filter((meal: Meal) => meal.date === customDate);
      
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return meals.filter((meal: Meal) => {
          const mealDate = new Date(meal.date);
          return mealDate >= weekStart && mealDate <= weekEnd;
        });
      
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return meals.filter((meal: Meal) => {
          const mealDate = new Date(meal.date);
          return mealDate >= monthStart && mealDate <= monthEnd;
        });
      
      default:
        return meals;
    }
  }, [meals, timeFilter, customDate]);

  // Prepara i dati per i grafici
  const chartData = useMemo((): ChartData[] => {
    if (!filteredMeals || filteredMeals.length === 0) return [];

    // Raggruppa i pasti per data
    const mealsByDate = filteredMeals.reduce((acc: { [key: string]: Meal[] }, meal: Meal) => {
      if (!acc[meal.date]) {
        acc[meal.date] = [];
      }
      acc[meal.date].push(meal);
      return acc;
    }, {});

    // Calcola i totali per ogni data
    return Object.entries(mealsByDate)
      .map(([date, dayMeals]) => {
        const totals = (dayMeals as Meal[]).reduce((acc: any, meal: Meal) => {
          acc.calories += meal.calories || 0;
          acc.protein += meal.protein || 0;
          acc.carbs += meal.carbs || 0;
          acc.fat += meal.fat || 0;
          acc.meals += 1;
          return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 });

        return {
          date,
          ...totals
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredMeals]);

  // Calcola le statistiche totali
  const totalStats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
    }

    return chartData.reduce((acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
      meals: acc.meals + day.meals
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 });
  }, [chartData]);

  // Calcola le medie giornaliere
  const averageStats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const days = chartData.length;
    return {
      calories: Math.round(totalStats.calories / days),
      protein: Math.round((totalStats.protein / days) * 10) / 10,
      carbs: Math.round((totalStats.carbs / days) * 10) / 10,
      fat: Math.round((totalStats.fat / days) * 10) / 10
    };
  }, [chartData, totalStats]);

  // Opzioni per i grafici
  const chartOptions = [
    { value: 'calories', label: 'Calorie', color: '#ef4444' },
    { value: 'protein', label: 'Proteine', color: '#3b82f6' },
    { value: 'carbs', label: 'Carboidrati', color: '#f59e0b' },
    { value: 'fat', label: 'Grassi', color: '#10b981' }
  ];

  // Formatta le date per i grafici
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeFilter === 'week') {
      return date.toLocaleDateString('it-IT', { weekday: 'short' });
    } else if (timeFilter === 'month') {
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    } else {
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    }
  };

  // Gestione pasti
  const handleToggleMealCompleted = async (meal: Meal) => {
    try {
      await dispatch(updateMeal({
        id: meal.id,
        mealData: {
          ...meal,
          completed: !meal.completed,
          completedAt: !meal.completed ? new Date().toISOString() : undefined
        }
      })).unwrap();
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del pasto:', error);
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowEditModal(true);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo pasto?')) {
      try {
        await dispatch(deleteMeal(mealId)).unwrap();
      } catch (error) {
        console.error('Errore durante l\'eliminazione del pasto:', error);
      }
    }
  };

  // Vista dettagliata giornaliera
  const renderDailyView = () => {
    const dayMeals = filteredMeals || [];
    const completedMeals = dayMeals.filter((meal: Meal) => meal.completed);
    
    // Calcola la distribuzione dei macronutrienti per il grafico
    const macroDistribution = [
      { name: 'Proteine', value: totalStats.protein * 4, color: '#3b82f6', percentage: Math.round((totalStats.protein * 4 / totalStats.calories) * 100) || 0 },
      { name: 'Carboidrati', value: totalStats.carbs * 4, color: '#f59e0b', percentage: Math.round((totalStats.carbs * 4 / totalStats.calories) * 100) || 0 },
      { name: 'Grassi', value: totalStats.fat * 9, color: '#10b981', percentage: Math.round((totalStats.fat * 9 / totalStats.calories) * 100) || 0 }
    ];

    // Calcola i micronutrienti
    const micronutrients = {
      fiber: dayMeals.reduce((acc, meal) => acc + (meal.fiber || 0), 0),
      sodium: dayMeals.reduce((acc, meal) => acc + (meal.sodium || 0), 0),
      potassium: dayMeals.reduce((acc, meal) => acc + (meal.potassium || 0), 0),
      calcium: dayMeals.reduce((acc, meal) => acc + (meal.calcium || 0), 0),
      iron: dayMeals.reduce((acc, meal) => acc + (meal.iron || 0), 0)
    };

    // Calcola il progresso dei pasti
    const mealProgress = dayMeals.length > 0 ? (completedMeals.length / dayMeals.length) * 100 : 0;
    
    return (
      <div className="space-y-6">
        {/* Statistiche principali del giorno */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
              <FireIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {totalStats.calories}
            </div>
            <div className="text-sm text-gray-600">Calorie</div>
            <div className="text-xs text-gray-500 mt-1">Target: 2000</div>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <HeartIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {totalStats.protein}g
            </div>
            <div className="text-sm text-gray-600">Proteine</div>
            <div className="text-xs text-gray-500 mt-1">Target: 150g</div>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-3">
              <BoltIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {totalStats.carbs}g
            </div>
            <div className="text-sm text-gray-600">Carboidrati</div>
            <div className="text-xs text-gray-500 mt-1">Target: 200g</div>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <HeartIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {totalStats.fat}g
            </div>
            <div className="text-sm text-gray-600">Grassi</div>
            <div className="text-xs text-gray-500 mt-1">Target: 67g</div>
          </Card>
        </div>

        {/* Grafici e analisi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grafico distribuzione macronutrienti */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-primary-600" />
              Distribuzione Macronutrienti
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} kcal`, 'Calorie']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {macroDistribution.map((macro, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium text-gray-900">{macro.percentage}%</div>
                  <div className="text-xs text-gray-500">{macro.name}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Progresso pasti */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-primary-600" />
              Progresso Pasti
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {Math.round(mealProgress)}%
                </div>
                <div className="text-sm text-gray-600">
                  {completedMeals.length} di {dayMeals.length} pasti completati
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${mealProgress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">{completedMeals.length}</div>
                  <div className="text-xs text-gray-500">Completati</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-400">{dayMeals.length - completedMeals.length}</div>
                  <div className="text-xs text-gray-500">Rimanenti</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Micronutrienti */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-primary-600" />
            Micronutrienti
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{micronutrients.fiber.toFixed(1)}g</div>
              <div className="text-xs text-gray-600">Fibra</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{micronutrients.sodium.toFixed(0)}mg</div>
              <div className="text-xs text-gray-600">Sodio</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">{micronutrients.potassium.toFixed(0)}mg</div>
              <div className="text-xs text-gray-600">Potassio</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{micronutrients.calcium.toFixed(0)}mg</div>
              <div className="text-xs text-gray-600">Calcio</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{micronutrients.iron.toFixed(1)}mg</div>
              <div className="text-xs text-gray-600">Ferro</div>
            </div>
          </div>
        </Card>

        {/* Lista pasti del giorno */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
            Pasti del Giorno ({completedMeals.length}/{dayMeals.length} completati)
          </h3>
          <div className="space-y-3">
            {dayMeals.map((meal: Meal) => (
              <div key={meal.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                meal.completed ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 hover:shadow-sm'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 capitalize flex items-center gap-2">
                      {meal.type === 'breakfast' && <SunIcon className="w-4 h-4 text-yellow-500" />}
                      {meal.type === 'lunch' && <HeartIcon className="w-4 h-4 text-orange-500" />}
                      {meal.type === 'dinner' && <MoonIcon className="w-4 h-4 text-blue-500" />}
                      {meal.type === 'snack' && <SparklesIcon className="w-4 h-4 text-green-500" />}
                      {meal.type} - {meal.calories} kcal
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      P: {meal.protein}g | C: {meal.carbs}g | G: {meal.fat}g
                    </p>
                    {meal.items && meal.items.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        <div className="font-medium text-gray-700 mb-1">Alimenti:</div>
                        <div className="flex flex-wrap gap-1">
                          {meal.items.map((item, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {item.foodName} ({item.grams}g)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={meal.completed ? 'success' : 'gray'}>
                      {meal.completed ? 'Completato' : 'Da completare'}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleMealCompleted(meal)}
                        className={`p-1 ${meal.completed ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-green-600'}`}
                      >
                        {meal.completed ? (
                          <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                          <CircleStackIcon className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMeal(meal)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
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
          <p className="text-neutral-600 text-lg">Caricamento dashboard...</p>
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
                <ChartBarIcon className="w-8 h-8 text-primary-500" />
                Dashboard Avanzata
              </h1>
              <p className="text-neutral-600 text-lg">
                Analisi dettagliata dei tuoi progressi nutrizionali
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="today">Oggi</option>
                <option value="week">Settimana</option>
                <option value="month">Mese</option>
                <option value="custom">Data specifica</option>
              </select>
              
              {timeFilter === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Statistiche Principali */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <FireIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1">
            {averageStats.calories}
          </div>
          <div className="text-sm text-neutral-600">Calorie/Giorno</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            <HeartIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {averageStats.protein}g
          </div>
          <div className="text-sm text-neutral-600">Proteine/Giorno</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-4">
            <BoltIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-600 mb-1">
            {averageStats.carbs}g
          </div>
          <div className="text-sm text-neutral-600">Carboidrati/Giorno</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
            <HeartIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {averageStats.fat}g
          </div>
          <div className="text-sm text-neutral-600">Grassi/Giorno</div>
        </Card>
      </motion.div>

      {/* Contenuto principale */}
      {timeFilter === 'today' || timeFilter === 'custom' ? (
        renderDailyView()
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Selezione grafico */}
          <Card className="p-6">
            <div className="flex flex-wrap gap-2">
              {chartOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedChart === option.value ? 'primary' : 'secondary'}
                  onClick={() => setSelectedChart(option.value)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Grafico principale */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {chartOptions.find(opt => opt.value === selectedChart)?.label} - 
              {timeFilter === 'week' ? ' Settimana' : ' Mese'}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartData && chartData.length > 0 ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label)}
                      formatter={(value: number) => [
                        `${value}${selectedChart === 'calories' ? ' kcal' : 'g'}`, 
                        chartOptions.find(opt => opt.value === selectedChart)?.label
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={selectedChart} 
                      stroke={chartOptions.find(opt => opt.value === selectedChart)?.color || '#3b82f6'}
                      fill={chartOptions.find(opt => opt.value === selectedChart)?.color || '#3b82f6'}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Nessun dato disponibile per il periodo selezionato</p>
                    </div>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Riepilogo periodo */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Riepilogo {timeFilter === 'week' ? 'Settimanale' : 'Mensile'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {totalStats.calories}
                </div>
                <div className="text-sm text-gray-600">Calorie Totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {totalStats.meals}
                </div>
                <div className="text-sm text-gray-600">Pasti Registrati</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {Math.round(totalStats.calories / Math.max(totalStats.meals, 1))}
                </div>
                <div className="text-sm text-gray-600">Calorie/Pasto</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {chartData.length}
                </div>
                <div className="text-sm text-gray-600">Giorni Attivi</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Modal per modifica pasto */}
      {showEditModal && editingMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Modifica Pasto
            </h3>
            <p className="text-gray-600 mb-4">
              Funzionalità di modifica in arrivo. Per ora puoi eliminare e ricreare il pasto.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="primary"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Chiudi
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleDeleteMeal(editingMeal.id);
                  setShowEditModal(false);
                }}
                className="flex-1"
              >
                Elimina Pasto
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDashboard;
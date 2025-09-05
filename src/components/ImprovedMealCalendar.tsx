import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMealsByDate, updateMeal, deleteMeal, completeMeal, fetchMeals } from '../features/meals/mealsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid
} from '@heroicons/react/24/solid';
import MealCalendarAssignmentModal from './MealCalendarAssignmentModal';
import MealCreator from './MealCreator';
import ErrorBoundary from './ErrorBoundary';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import type { Meal } from '../types';

// Definizioni globali
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

// Componente per pasto compatto
const CompactMealCard: React.FC<{
  meal: Meal;
  onMealClick: (meal: Meal) => void;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => void;
  onToggleComplete: (meal: Meal) => void;
}> = ({ meal, onMealClick, onEditMeal, onDeleteMeal, onToggleComplete }) => {
  const IconComponent = mealTypeIcons[meal.type];
  const colorClass = mealTypeColors[meal.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${colorClass} ${
        meal.completed ? 'opacity-75' : ''
      }`}
      onClick={() => onMealClick(meal)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <IconComponent className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {mealTypeLabels[meal.type]}
            </p>
            {meal.calories && (
              <p className="text-xs opacity-75">
                {meal.calories} kcal
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {meal.completed && (
            <CheckCircleIconSolid className="w-4 h-4 text-green-600" />
          )}
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(meal);
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {meal.completed ? (
                <CheckCircleIconSolid className="w-4 h-4 text-green-600" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditMeal(meal);
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMeal(meal.id);
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ImprovedMealCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { meals, isLoading } = useAppSelector((state: any) => state.meals as any);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [showMealCreator, setShowMealCreator] = useState(false);
  const [showMealCatalog, setShowMealCatalog] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);

  // Carica i pasti per la data corrente
  useEffect(() => {
    const dateStr = currentDate.toISOString().split('T')[0];
    dispatch(fetchMealsByDate({ startDate: dateStr, endDate: dateStr }));
  }, [dispatch, currentDate]);

  // Funzioni di navigazione
  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    // Ricarica i pasti per oggi
    const dateStr = today.toISOString().split('T')[0];
    dispatch(fetchMealsByDate({ startDate: dateStr, endDate: dateStr }));
  };

  // Funzioni per gestire i pasti
  const handleAddMeal = (date: Date, mealType: string) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedMealType(mealType);
    setShowMealCatalog(true);
  };

  const handleMealClick = (meal: Meal) => {
    setViewingMeal(meal);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowMealCreator(true);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo pasto?')) {
      try {
        await dispatch(deleteMeal(mealId)).unwrap();
        const dateStr = currentDate.toISOString().split('T')[0];
        dispatch(fetchMealsByDate({ startDate: dateStr, endDate: dateStr }));
      } catch (error) {
        console.error('Errore durante l\'eliminazione del pasto:', error);
        alert('Errore durante l\'eliminazione del pasto');
      }
    }
  };

  const toggleMealCompleted = async (meal: Meal) => {
    try {
      await dispatch(completeMeal({ 
        mealId: meal.id, 
        completed: !meal.completed 
      })).unwrap();
      const dateStr = currentDate.toISOString().split('T')[0];
      dispatch(fetchMealsByDate({ startDate: dateStr, endDate: dateStr }));
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del pasto:', error);
      alert('Errore durante l\'aggiornamento del pasto');
    }
  };

  const handleMealCreated = (meal: Meal) => {
    setShowMealCreator(false);
    setEditingMeal(null);
    const dateStr = currentDate.toISOString().split('T')[0];
    dispatch(fetchMealsByDate({ startDate: dateStr, endDate: dateStr }));
  };

  const handleMealAssigned = () => {
    setShowMealCatalog(false);
    const dateStr = currentDate.toISOString().split('T')[0];
    // Aggiorna sia i pasti per la data specifica che la lista generale
    dispatch(fetchMealsByDate({ startDate: dateStr, endDate: dateStr }));
    dispatch(fetchMeals());
  };

  // Funzioni di utilità
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getMealsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meals.filter((meal: Meal) => meal.date === dateStr);
  };

  const getMealsForTimeSlot = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return meals.filter((meal: Meal) => 
      meal.date === dateStr && meal.type === mealType
    );
  };

  // Calcola statistiche giornaliere
  const getDailyStats = (date: Date) => {
    const dayMeals = getMealsForDate(date);
    const totalCalories = dayMeals.reduce((sum: number, meal: Meal) => sum + (meal.calories || 0), 0);
    const completedMeals = dayMeals.filter((meal: Meal) => meal.completed).length;
    const totalMeals = dayMeals.length;
    
    return {
      totalCalories,
      completedMeals,
      totalMeals,
      completionRate: totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0
    };
  };

  // Render vista giornaliera migliorata
  const renderDayView = () => {
    const stats = getDailyStats(currentDate);
    const dayMeals = getMealsForDate(currentDate);

    return (
      <div className="space-y-6">
        {/* Header con statistiche */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {formatDate(currentDate)}
              </h2>
              {isToday(currentDate) && (
                <Badge variant="success" className="mt-2">
                  Oggi
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {stats.totalCalories}
                </div>
                <div className="text-sm text-neutral-600">kcal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedMeals}/{stats.totalMeals}
                </div>
                <div className="text-sm text-neutral-600">pasti</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.completionRate)}%
                </div>
                <div className="text-sm text-neutral-600">completato</div>
              </div>
            </div>
          </div>
          
          {/* Barra di progresso */}
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </Card>

        {/* Slot per ogni tipo di pasto */}
        {Object.entries(mealTypeLabels).map(([type, label]) => {
          const typeMeals = getMealsForTimeSlot(currentDate, type);
          const IconComponent = mealTypeIcons[type];
          const colorClass = mealTypeColors[type];

          return (
            <Card key={type} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {label}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {typeMeals.length} pasto{typeMeals.length !== 1 ? 'i' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleAddMeal(currentDate, type)}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Aggiungi
                </Button>
              </div>

              <div className="space-y-3">
                {typeMeals.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <IconComponent className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nessun pasto programmato</p>
                    <Button
                      onClick={() => handleAddMeal(currentDate, type)}
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                    >
                      Aggiungi il primo pasto
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {typeMeals.map((meal: Meal) => (
                      <CompactMealCard
                        key={meal.id}
                        meal={meal}
                        onMealClick={handleMealClick}
                        onEditMeal={handleEditMeal}
                        onDeleteMeal={handleDeleteMeal}
                        onToggleComplete={toggleMealCompleted}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render vista mensile
  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Genera 42 giorni (6 settimane)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    return (
      <div className="space-y-6">
        {/* Header mese */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
        </Card>

        {/* Griglia mensile */}
        <Card className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-neutral-600 p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dayMeals = getMealsForDate(date);
              const stats = getDailyStats(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[80px] p-2 border border-neutral-200 rounded-lg ${
                    isCurrentMonth ? 'bg-white' : 'bg-neutral-50'
                  } ${isToday ? 'ring-2 ring-primary-500 bg-primary-50' : ''} ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isWeekend ? 'text-red-600' : 'text-neutral-900'
                    } ${isToday ? 'text-primary-600' : ''}`}>
                      {date.getDate()}
                    </span>
                    {dayMeals.length > 0 && (
                      <span className="text-xs text-green-600">
                        {stats.completedMeals}/{stats.totalMeals}
                      </span>
                    )}
                  </div>
                  
                  {dayMeals.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-neutral-600">
                        {stats.totalCalories} kcal
                      </div>
                      <div className="space-y-1">
                        {dayMeals.slice(0, 2).map((meal: Meal) => {
                          const mealTypeColors = {
                            breakfast: 'bg-yellow-100 text-yellow-800',
                            lunch: 'bg-red-100 text-red-800',
                            dinner: 'bg-blue-100 text-blue-800',
                            snack: 'bg-purple-100 text-purple-800'
                          };
                          const colorClass = mealTypeColors[meal.type];
                          return (
                            <div
                              key={meal.id}
                              className={`text-xs p-1 rounded ${colorClass} ${
                                meal.completed ? 'opacity-75' : ''
                              }`}
                              onClick={() => handleMealClick(meal)}
                            >
                              {mealTypeLabels[meal.type]}
                            </div>
                          );
                        })}
                        {dayMeals.length > 2 && (
                          <div className="text-xs text-neutral-500">
                            +{dayMeals.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleAddMeal(date, 'breakfast')}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs mt-1"
                  >
                    <PlusIcon className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  // Render vista settimanale migliorata
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <div className="space-y-6">
        {/* Header settimana */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">
              Settimana del {startOfWeek.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
            </h2>
          </div>
        </Card>

        {/* Griglia settimanale */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const dayMeals = getMealsForDate(date);
            const stats = getDailyStats(date);
            const isCurrentDay = isToday(date);
            const isWeekend = index === 0 || index === 6;

            return (
              <Card key={date.toISOString()} className={`p-4 ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}`}>
                <div className="text-center mb-3">
                  <div className={`text-sm font-medium ${isWeekend ? 'text-red-600' : 'text-neutral-900'}`}>
                    {date.toLocaleDateString('it-IT', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${isCurrentDay ? 'text-primary-600' : 'text-neutral-700'}`}>
                    {date.getDate()}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-xs text-neutral-600">
                      {stats.totalCalories} kcal
                    </div>
                    <div className="text-xs text-green-600">
                      {stats.completedMeals}/{stats.totalMeals}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {dayMeals.slice(0, 3).map((meal: Meal) => (
                      <div
                        key={meal.id}
                        className={`text-xs p-1 rounded ${mealTypeColors[meal.type]} ${
                          meal.completed ? 'opacity-75' : ''
                        }`}
                        onClick={() => handleMealClick(meal)}
                      >
                        {mealTypeLabels[meal.type]}
                      </div>
                    ))}
                    {dayMeals.length > 3 && (
                      <div className="text-xs text-neutral-500 text-center">
                        +{dayMeals.length - 3} altri
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleAddMeal(date, 'breakfast')}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <PlusIcon className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header principale */}
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
                Calendario Pasti
              </h1>
              <p className="text-neutral-600 text-lg">
                Pianifica e traccia i tuoi pasti quotidiani
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={goToToday}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <CalendarDaysIconSolid className="w-4 h-4" />
                Oggi
              </Button>
              <Button
                onClick={() => setShowMealCreator(true)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Nuovo Pasto
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Controlli di navigazione */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => handleDateChange('prev')}
              variant="ghost"
              size="sm"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => handleDateChange('next')}
              variant="ghost"
              size="sm"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode('day')}
              variant={viewMode === 'day' ? 'primary' : 'ghost'}
              size="sm"
            >
              Giorno
            </Button>
            <Button
              onClick={() => setViewMode('week')}
              variant={viewMode === 'week' ? 'primary' : 'ghost'}
              size="sm"
            >
              Settimana
            </Button>
            <Button
              onClick={() => setViewMode('month')}
              variant={viewMode === 'month' ? 'primary' : 'ghost'}
              size="sm"
            >
              Mese
            </Button>
          </div>
        </div>
      </Card>

      {/* Contenuto principale */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </motion.div>

      {/* Modali */}
      <AnimatePresence>
        {showMealCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMealCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <MealCreator
                onMealCreated={handleMealCreated}
                editingMeal={editingMeal}
                onCancel={() => {
                  setShowMealCreator(false);
                  setEditingMeal(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {showMealCatalog && (
          <MealCalendarAssignmentModal
            isOpen={showMealCatalog}
            selectedDate={selectedDate}
            selectedMealType={selectedMealType}
            onMealAssigned={handleMealAssigned}
            onClose={() => setShowMealCatalog(false)}
          />
        )}
      </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default ImprovedMealCalendar;

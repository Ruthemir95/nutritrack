import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ClockIcon, FireIcon, HeartIcon, SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import type { Meal } from '../types';

interface MealDetailProps {
  meal: Meal;
  onClose: () => void;
}

const MealDetail: React.FC<MealDetailProps> = ({ meal, onClose }) => {
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

  const IconComponent = mealTypeIcons[meal.type];
  const colorClass = mealTypeColors[meal.type];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {mealTypeLabels[meal.type]}
            </h2>
            <p className="text-neutral-600">
              {formatDate(meal.date)}
            </p>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="p-2"
        >
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Stato completamento */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {meal.completed ? (
            <CheckCircleIconSolid className="w-6 h-6 text-green-600" />
          ) : (
            <CheckCircleIcon className="w-6 h-6 text-neutral-400" />
          )}
          <Badge variant={meal.completed ? 'success' : 'secondary'}>
            {meal.completed ? 'Completato' : 'In attesa'}
          </Badge>
          {meal.completedAt && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <ClockIcon className="w-4 h-4" />
              Completato il {formatTime(meal.completedAt)}
            </div>
          )}
        </div>
      </div>

      {/* Valori nutrizionali */}
      {meal.calories && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-red-500" />
            Valori Nutrizionali
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {Math.round(meal.calories)}
              </div>
              <div className="text-sm text-neutral-600">kcal</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(meal.protein || 0)}g
              </div>
              <div className="text-sm text-neutral-600">Proteine</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {Math.round(meal.carbs || 0)}g
              </div>
              <div className="text-sm text-neutral-600">Carboidrati</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(meal.fats || 0)}g
              </div>
              <div className="text-sm text-neutral-600">Grassi</div>
            </div>
          </div>
        </Card>
      )}

      {/* Lista alimenti */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Alimenti ({meal.items.length})
        </h3>
        <div className="space-y-3">
          {meal.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900">
                  {item.foodName}
                </h4>
                {item.food?.brand && (
                  <p className="text-sm text-neutral-500">
                    {item.food.brand}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  {item.grams}g
                </div>
                {item.calculatedNutrients && (
                  <div className="text-sm text-neutral-500">
                    {Math.round(item.calculatedNutrients.kcal)} kcal
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Note */}
      {meal.notes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Note
          </h3>
          <p className="text-neutral-700">
            {meal.notes}
          </p>
        </Card>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={onClose}
          variant="secondary"
        >
          Chiudi
        </Button>
      </div>
    </div>
  );
};

export default MealDetail;

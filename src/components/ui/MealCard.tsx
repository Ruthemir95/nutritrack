import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string;
    completed: boolean;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    items: Array<{
      foodName: string;
      grams: number;
    }>;
  };
  onComplete?: (mealId: string) => void;
  onEdit?: (mealId: string) => void;
  onView?: (mealId: string) => void;
  className?: string;
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  onComplete,
  onEdit,
  onView,
  className = '',
}) => {
  const getMealTypeInfo = (type: string) => {
    const types = {
      breakfast: { label: 'Colazione', emoji: '🌅', gradient: 'meal-breakfast' },
      lunch: { label: 'Pranzo', emoji: '☀️', gradient: 'meal-lunch' },
      dinner: { label: 'Cena', emoji: '🌙', gradient: 'meal-dinner' },
      snack: { label: 'Snack', emoji: '🍎', gradient: 'meal-snack' },
    };
    return types[type as keyof typeof types] || types.breakfast;
  };

  const mealTypeInfo = getMealTypeInfo(meal.type);
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        className={`relative overflow-hidden ${meal.completed ? 'opacity-90' : ''}`}
        hover
        interactive
        onClick={() => onView?.(meal.id)}
      >
        {/* Header with meal type and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${mealTypeInfo.gradient} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`}>
              {mealTypeInfo.emoji}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {meal.name || mealTypeInfo.label}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>{formatTime(meal.date)}</span>
                <span>•</span>
                <span>{formatDate(meal.date)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {meal.completed ? (
              <CheckCircleIconSolid className="w-6 h-6 text-success-600" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>

        {/* Nutrition info */}
        {meal.calories && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(meal.calories)}
              </span>
              <span className="text-sm text-gray-500">kcal</span>
            </div>
            
            <div className="flex space-x-3">
              {meal.protein && (
                <Badge variant="primary" size="sm">
                  {Math.round(meal.protein)}g proteine
                </Badge>
              )}
              {meal.carbs && (
                <Badge variant="success" size="sm">
                  {Math.round(meal.carbs)}g carboidrati
                </Badge>
              )}
              {meal.fat && (
                <Badge variant="warning" size="sm">
                  {Math.round(meal.fat)}g grassi
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Food items preview */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {meal.items.slice(0, 3).map((item, index) => (
              <Badge key={index} variant="gray" size="sm">
                {item.foodName} ({item.grams}g)
              </Badge>
            ))}
            {meal.items.length > 3 && (
              <Badge variant="gray" size="sm">
                +{meal.items.length - 3} altri
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant={meal.completed ? 'success' : 'primary'}
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onComplete?.(meal.id);
            }}
            leftIcon={meal.completed ? <CheckCircleIconSolid className="w-4 h-4" /> : undefined}
          >
            {meal.completed ? 'Completato' : 'Segna come completato'}
          </Button>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(meal.id);
              }}
            >
              Modifica
            </Button>
          )}
        </div>

        {/* Completion overlay */}
        {meal.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-success-50/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <CheckCircleIconSolid className="w-12 h-12 text-success-600 mx-auto mb-2" />
              <p className="text-success-700 font-semibold">Completato!</p>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default MealCard;

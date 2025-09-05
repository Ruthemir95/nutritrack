import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, FireIcon, HeartIcon, BeakerIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import type { Food } from '../types';

interface FoodDetailProps {
  food: Food;
  onClose: () => void;
}

const FoodDetail: React.FC<FoodDetailProps> = ({ food, onClose }) => {
  const formatValue = (value: number | null | undefined, unit: string = '') => {
    if (value === null || value === undefined) return 'N/A';
    return `${Math.round(value * 10) / 10}${unit}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Frutta': 'bg-green-50 border-green-200 text-green-800',
      'Verdura': 'bg-emerald-50 border-emerald-200 text-emerald-800',
      'Carne': 'bg-red-50 border-red-200 text-red-800',
      'Pesce': 'bg-blue-50 border-blue-200 text-blue-800',
      'Latticini': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'Cereali': 'bg-amber-50 border-amber-200 text-amber-800',
      'Legumi': 'bg-orange-50 border-orange-200 text-orange-800',
      'Generale': 'bg-neutral-50 border-neutral-200 text-neutral-800'
    };
    return colors[category] || colors['Generale'];
  };

  const getNutritionGrade = (kcal: number) => {
    if (kcal <= 50) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (kcal <= 150) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (kcal <= 300) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const nutritionGrade = getNutritionGrade(food.per100g.kcal);
  const categoryColor = getCategoryColor(food.category);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${categoryColor}`}>
            <HeartIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {food.name}
            </h2>
            {food.brand && (
              <p className="text-neutral-600">
                {food.brand}
              </p>
            )}
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

      {/* Categoria e Grade */}
      <div className="flex items-center gap-4 mb-6">
        <Badge className={categoryColor}>
          {food.category}
        </Badge>
        <div className={`px-3 py-1 rounded-full ${nutritionGrade.bg}`}>
          <span className={`text-sm font-bold ${nutritionGrade.color}`}>
            Grado {nutritionGrade.grade}
          </span>
        </div>
      </div>

      {/* Valori nutrizionali principali */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-red-500" />
          Valori Nutrizionali (per 100g)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatValue(food.per100g.kcal)}
            </div>
            <div className="text-sm text-neutral-600">kcal</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatValue(food.per100g.protein, 'g')}
            </div>
            <div className="text-sm text-neutral-600">Proteine</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {formatValue(food.per100g.carbs, 'g')}
            </div>
            <div className="text-sm text-neutral-600">Carboidrati</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatValue(food.per100g.fats, 'g')}
            </div>
            <div className="text-sm text-neutral-600">Grassi</div>
          </div>
        </div>
      </Card>

      {/* Valori nutrizionali dettagliati */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <BeakerIcon className="w-5 h-5 text-purple-500" />
          Valori Dettagliati
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-700 mb-1">
              {formatValue(food.per100g.fiber, 'g')}
            </div>
            <div className="text-sm text-neutral-600">Fibra</div>
          </div>
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-700 mb-1">
              {formatValue(food.per100g.sodium, 'mg')}
            </div>
            <div className="text-sm text-neutral-600">Sodio</div>
          </div>
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-700 mb-1">
              {formatValue(food.per100g.potassium, 'mg')}
            </div>
            <div className="text-sm text-neutral-600">Potassio</div>
          </div>
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-700 mb-1">
              {formatValue(food.per100g.calcium, 'mg')}
            </div>
            <div className="text-sm text-neutral-600">Calcio</div>
          </div>
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-700 mb-1">
              {formatValue(food.per100g.iron, 'mg')}
            </div>
            <div className="text-sm text-neutral-600">Ferro</div>
          </div>
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-neutral-700 mb-1">
              {formatValue(food.per100g.vitaminC, 'mg')}
            </div>
            <div className="text-sm text-neutral-600">Vitamina C</div>
          </div>
        </div>
      </Card>

      {/* Barcode */}
      {food.barcode && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
            Codice a Barre
          </h3>
          <div className="bg-neutral-100 p-3 rounded-lg font-mono text-lg">
            {food.barcode}
          </div>
        </Card>
      )}

      {/* Tags */}
      {food.tags && food.tags.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Tag
          </h3>
          <div className="flex flex-wrap gap-2">
            {food.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
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

export default FoodDetail;

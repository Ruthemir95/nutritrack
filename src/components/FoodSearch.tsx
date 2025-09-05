import React, { useState, useEffect } from 'react';
import { getFoodSuggestions, searchFoodByName } from '../services/nutritionApi';
import type { NutritionData } from '../services/nutritionApi';

interface FoodSearchProps {
  onFoodSelect: (food: NutritionData) => void;
  placeholder?: string;
}

const FoodSearch: React.FC<FoodSearchProps> = ({ onFoodSelect, placeholder = "Cerca un alimento..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NutritionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchFoods = async () => {
      setIsLoading(true);
      try {
        const results = await getFoodSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Errore nella ricerca:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchFoods, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleFoodSelect = (food: NutritionData) => {
    setQuery(food.name);
    setShowSuggestions(false);
    onFoodSelect(food);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay per permettere il click sui suggerimenti
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            paddingRight: isLoading ? '2.5rem' : '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
          }}
        />
        
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280'
          }}>
            <div style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {suggestions.map((food, index) => (
            <div
              key={food.id}
              onClick={() => handleFoodSelect(food)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    fontSize: '0.875rem'
                  }}>
                    {food.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    {food.category} • {food.per100g.kcal} kcal/100g
                  </div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textAlign: 'right'
                }}>
                  <div>P: {food.per100g.protein}g</div>
                  <div>C: {food.per100g.carbs}g</div>
                  <div>F: {food.per100g.fats}g</div>
                </div>
              </div>
              
              {food.tags && food.tags.length > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.25rem'
                }}>
                  {food.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      style={{
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.625rem',
                        fontWeight: '500'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && query.length >= 2 && !isLoading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          padding: '1rem',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          Nessun alimento trovato per "{query}"
        </div>
      )}
    </div>
  );
};

export default FoodSearch;

// Servizio per l'API nutrizionale Nutritionix
// Documentazione: https://www.nutritionix.com/business/api

import { API_CONFIG } from '../config/api';

interface NutritionixFood {
  food_name: string;
  brand_name?: string;
  serving_unit: string;
  serving_weight_grams: number;
  nf_calories: number;
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
  nf_dietary_fiber: number;
  nf_sodium: number;
  nf_potassium: number;
  nf_calcium_dv: number;
  nf_iron_dv: number;
  nf_vitamin_c_dv: number;
  nf_vitamin_d_dv: number;
}

interface NutritionixResponse {
  foods: NutritionixFood[];
}

interface ProcessedFood {
  name: string;
  brand?: string;
  category: string;
  per100g: {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sodium: number;
    potassium: number;
    calcium: number;
    iron: number;
    vitaminC: number;
    vitaminD: number;
  };
  tags: string[];
}

// Configurazione API
const NUTRITIONIX_APP_ID = API_CONFIG.NUTRITIONIX.APP_ID;
const NUTRITIONIX_API_KEY = API_CONFIG.NUTRITIONIX.API_KEY;
const NUTRITIONIX_BASE_URL = API_CONFIG.NUTRITIONIX.BASE_URL;

// Funzione per cercare un alimento
export const searchFoodByName = async (foodName: string): Promise<ProcessedFood | null> => {
  try {
    // Usa direttamente l'endpoint natural/nutrients per ottenere i dati nutrizionali
    const nutritionData = await getFoodNutrition(foodName);
    
    if (!nutritionData) {
      return null;
    }

    return nutritionData;
  } catch (error) {
    console.error('Errore nella ricerca alimento:', error);
    return null;
  }
};

// Funzione per ottenere i dettagli nutrizionali
const getFoodNutrition = async (foodName: string): Promise<ProcessedFood | null> => {
  try {
    const response = await fetch(`${NUTRITIONIX_BASE_URL}/natural/nutrients`, {
      method: 'POST',
      headers: {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `100g ${foodName}`
      })
    });

    if (!response.ok) {
      throw new Error(`Errore API: ${response.status}`);
    }

    const data: NutritionixResponse = await response.json();
    
    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];
    
    // Calcola i valori per 100g
    const servingWeight = food.serving_weight_grams || 100;
    const multiplier = 100 / servingWeight;

    return {
      name: food.food_name,
      brand: food.brand_name,
      category: getCategoryFromFood(food.food_name),
      per100g: {
        kcal: Math.round(food.nf_calories * multiplier),
        protein: Math.round(food.nf_protein * multiplier * 10) / 10,
        carbs: Math.round(food.nf_total_carbohydrate * multiplier * 10) / 10,
        fats: Math.round(food.nf_total_fat * multiplier * 10) / 10,
        fiber: Math.round(food.nf_dietary_fiber * multiplier * 10) / 10,
        sodium: Math.round(food.nf_sodium * multiplier),
        potassium: Math.round(food.nf_potassium * multiplier),
        calcium: Math.round(food.nf_calcium_dv * multiplier),
        iron: Math.round(food.nf_iron_dv * multiplier * 10) / 10,
        vitaminC: Math.round(food.nf_vitamin_c_dv * multiplier * 10) / 10,
        vitaminD: Math.round(food.nf_vitamin_d_dv * multiplier * 10) / 10
      },
      tags: generateTags(food.food_name, food.brand_name)
    };
  } catch (error) {
    console.error('Errore nel recupero dati nutrizionali:', error);
    return null;
  }
};

// Funzione per determinare la categoria dell'alimento
const getCategoryFromFood = (foodName: string): string => {
  const name = foodName.toLowerCase();
  
  if (name.includes('pollo') || name.includes('manzo') || name.includes('maiale') || 
      name.includes('tacchino') || name.includes('agnello') || name.includes('carne')) {
    return 'Proteine';
  }
  if (name.includes('pesce') || name.includes('salmone') || name.includes('tonno') || 
      name.includes('merluzzo') || name.includes('gamberi') || name.includes('gamberetti')) {
    return 'Pesce';
  }
  if (name.includes('riso') || name.includes('pasta') || name.includes('pane') || 
      name.includes('avena') || name.includes('quinoa') || name.includes('cereali')) {
    return 'Carboidrati';
  }
  if (name.includes('broccoli') || name.includes('spinaci') || name.includes('carote') || 
      name.includes('pomodori') || name.includes('peperoni') || name.includes('verdura')) {
    return 'Verdure';
  }
  if (name.includes('mela') || name.includes('banana') || name.includes('arancia') || 
      name.includes('uva') || name.includes('frutta') || name.includes('avocado')) {
    return 'Frutta';
  }
  if (name.includes('latte') || name.includes('yogurt') || name.includes('formaggio') || 
      name.includes('uova') || name.includes('burro')) {
    return 'Latticini';
  }
  if (name.includes('noci') || name.includes('mandorle') || name.includes('nocciole') || 
      name.includes('pistacchi') || name.includes('semi')) {
    return 'Frutta secca';
  }
  
  return 'Generale';
};

// Funzione per generare tag descrittivi
const generateTags = (foodName: string, brand?: string): string[] => {
  const tags: string[] = [];
  const name = foodName.toLowerCase();
  
  // Tag per tipo di alimento
  if (name.includes('integrale') || name.includes('whole')) {
    tags.push('integrale');
  }
  if (name.includes('biologico') || name.includes('organic')) {
    tags.push('biologico');
  }
  if (name.includes('fresco') || name.includes('fresh')) {
    tags.push('fresco');
  }
  if (name.includes('congelato') || name.includes('frozen')) {
    tags.push('congelato');
  }
  
  // Tag per valori nutrizionali
  if (name.includes('proteine') || name.includes('protein')) {
    tags.push('proteine');
  }
  if (name.includes('fibre') || name.includes('fiber')) {
    tags.push('fibre');
  }
  if (name.includes('vitamine') || name.includes('vitamin')) {
    tags.push('vitamine');
  }
  
  // Aggiungi brand se presente
  if (brand) {
    tags.push(brand.toLowerCase());
  }
  
  return tags;
};

// Funzione per calcolare i nutrienti per un peso specifico
export const calculateNutritionForGrams = (food: ProcessedFood, grams: number) => {
  const multiplier = grams / 100;
  
  return {
    kcal: Math.round(food.per100g.kcal * multiplier),
    protein: Math.round(food.per100g.protein * multiplier * 10) / 10,
    carbs: Math.round(food.per100g.carbs * multiplier * 10) / 10,
    fats: Math.round(food.per100g.fats * multiplier * 10) / 10,
    fiber: Math.round(food.per100g.fiber * multiplier * 10) / 10,
    sodium: Math.round(food.per100g.sodium * multiplier),
    potassium: Math.round(food.per100g.potassium * multiplier),
    calcium: Math.round(food.per100g.calcium * multiplier),
    iron: Math.round(food.per100g.iron * multiplier * 10) / 10,
    vitaminC: Math.round(food.per100g.vitaminC * multiplier * 10) / 10,
    vitaminD: Math.round(food.per100g.vitaminD * multiplier * 10) / 10
  };
};

// Funzione di fallback per alimenti non trovati
export const createFallbackFood = (foodName: string, grams: number): ProcessedFood => {
  return {
    name: foodName,
    brand: undefined,
    category: 'Generale',
    per100g: {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sodium: 0,
      potassium: 0,
      calcium: 0,
      iron: 0,
      vitaminC: 0,
      vitaminD: 0
    },
    tags: ['da-verificare']
  };
};
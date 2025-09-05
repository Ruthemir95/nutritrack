import { API_CONFIG } from '../config/api';

// Interfacce per Open Food Facts
interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  categories?: string;
  nutriments?: {
    energy_kcal_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    potassium_100g?: number;
    calcium_100g?: number;
    iron_100g?: number;
    'vitamin-c_100g'?: number;
    'vitamin-d_100g'?: number;
    cholesterol_100g?: number;
    sugars_100g?: number;
  };
  image_url?: string;
  image_nutrition_url?: string;
  image_ingredients_url?: string;
  ingredients_text?: string;
  allergens?: string;
  traces?: string;
  nutrition_grades?: string;
  ecoscore_grade?: string;
  nova_group?: number;
}

interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[];
  count: number;
  page: number;
  page_size: number;
}

interface ProcessedFood {
  name: string;
  brand?: string;
  category: string;
  barcode?: string;
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
  imageUrl?: string;
  nutritionGrade?: string;
  novaGroup?: number;
}

// Configurazione API
const OPENFOODFACTS_BASE_URL = 'https://world.openfoodfacts.org/api/v0';
const OPENFOODFACTS_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

// Funzione per cercare alimenti per nome
export const searchFoodByName = async (foodName: string): Promise<ProcessedFood | null> => {
  try {
    console.log(`🔍 Searching Open Food Facts for: ${foodName}`);
    
    const searchParams = new URLSearchParams({
      search_terms: foodName,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '20',
      sort_by: 'popularity'
    });

    const response = await fetch(`${OPENFOODFACTS_SEARCH_URL}?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OpenFoodFactsResponse = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.log(`❌ No products found for: ${foodName}`);
      return null;
    }

    // Prendi il primo prodotto più popolare
    const product = data.products[0];
    console.log(`✅ Found product: ${product.product_name}`);
    
    return processOpenFoodFactsProduct(product);
  } catch (error) {
    console.error(`Error searching Open Food Facts for ${foodName}:`, error);
    return null;
  }
};

// Funzione per cercare alimenti per barcode
export const searchFoodByBarcode = async (barcode: string): Promise<ProcessedFood | null> => {
  try {
    console.log(`🔍 Searching Open Food Facts by barcode: ${barcode}`);
    
    const response = await fetch(`${OPENFOODFACTS_BASE_URL}/product/${barcode}.json`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`❌ Product not found for barcode: ${barcode}`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 0 || !data.product) {
      console.log(`❌ No product found for barcode: ${barcode}`);
      return null;
    }

    console.log(`✅ Found product by barcode: ${data.product.product_name}`);
    return processOpenFoodFactsProduct(data.product);
  } catch (error) {
    console.error(`Error searching Open Food Facts by barcode ${barcode}:`, error);
    return null;
  }
};

// Funzione per processare i dati di Open Food Facts
const processOpenFoodFactsProduct = (product: OpenFoodFactsProduct): ProcessedFood => {
  const nutriments = product.nutriments || {};
  
  // Estrai categoria dalla stringa categories
  const category = extractCategory(product.categories || '');
  
  // Genera tags basati su categoria e nutrienti
  const tags = generateTags(product, category);
  
  // Calcola i valori nutrizionali per 100g
  const per100g = {
    kcal: Math.round(nutriments.energy_kcal_100g || 0),
    protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
    carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
    fats: Math.round((nutriments.fat_100g || 0) * 10) / 10,
    fiber: Math.round((nutriments.fiber_100g || 0) * 10) / 10,
    sodium: Math.round((nutriments.sodium_100g || 0) * 1000), // Converti da g a mg
    potassium: Math.round((nutriments.potassium_100g || 0) * 1000), // Converti da g a mg
    calcium: Math.round((nutriments.calcium_100g || 0) * 1000), // Converti da g a mg
    iron: Math.round((nutriments.iron_100g || 0) * 1000), // Converti da g a mg
    vitaminC: Math.round((nutriments['vitamin-c_100g'] || 0) * 10) / 10,
    vitaminD: Math.round((nutriments['vitamin-d_100g'] || 0) * 10) / 10
  };

  return {
    name: product.product_name || 'Prodotto sconosciuto',
    brand: product.brands || undefined,
    category,
    barcode: product.code,
    per100g,
    tags,
    imageUrl: product.image_url,
    nutritionGrade: product.nutrition_grades,
    novaGroup: product.nova_group
  };
};

// Funzione per estrarre la categoria principale
const extractCategory = (categoriesString: string): string => {
  if (!categoriesString) return 'Generale';
  
  const categories = categoriesString.split(',').map(cat => cat.trim());
  
  // Mappa delle categorie italiane
  const categoryMap: { [key: string]: string } = {
    'frutta': 'Frutta',
    'frutta fresca': 'Frutta',
    'frutta secca': 'Frutta Secca',
    'verdura': 'Verdure',
    'verdure': 'Verdure',
    'legumi': 'Legumi',
    'cereali': 'Cereali',
    'pasta': 'Carboidrati',
    'riso': 'Carboidrati',
    'pane': 'Carboidrati',
    'carne': 'Proteine',
    'pesce': 'Pesce',
    'latticini': 'Latticini',
    'latte': 'Latticini',
    'formaggio': 'Latticini',
    'yogurt': 'Latticini',
    'uova': 'Proteine',
    'olio': 'Grassi',
    'burro': 'Grassi',
    'dolci': 'Dolci',
    'biscotti': 'Dolci',
    'cioccolato': 'Dolci',
    'bevande': 'Bevande',
    'acqua': 'Bevande',
    'succhi': 'Bevande',
    'snack': 'Snack',
    'surgelati': 'Surgelati'
  };
  
  // Cerca la prima categoria che corrisponde
  for (const category of categories) {
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
  }
  
  return 'Generale';
};

// Funzione per generare tags
const generateTags = (product: OpenFoodFactsProduct, category: string): string[] => {
  const tags: string[] = [];
  
  // Aggiungi categoria come tag
  if (category !== 'Generale') {
    tags.push(category.toLowerCase());
  }
  
  // Aggiungi brand come tag
  if (product.brands) {
    tags.push(product.brands.toLowerCase().replace(/\s+/g, '-'));
  }
  
  // Aggiungi grade nutrizionale
  if (product.nutrition_grades) {
    tags.push(`grade-${product.nutrition_grades.toLowerCase()}`);
  }
  
  // Aggiungi NOVA group
  if (product.nova_group) {
    tags.push(`nova-${product.nova_group}`);
  }
  
  // Aggiungi tags basati sui nutrienti
  const nutriments = product.nutriments || {};
  if (nutriments.fiber_100g && nutriments.fiber_100g > 3) {
    tags.push('high-fiber');
  }
  if (nutriments.proteins_100g && nutriments.proteins_100g > 10) {
    tags.push('high-protein');
  }
  if (nutriments.fat_100g && nutriments.fat_100g < 3) {
    tags.push('low-fat');
  }
  if (nutriments.sodium_100g && nutriments.sodium_100g < 0.4) {
    tags.push('low-sodium');
  }
  
  return tags;
};

// Funzione per calcolare i nutrienti per una quantità specifica
export const calculateNutritionForGrams = (food: ProcessedFood, grams: number) => {
  const factor = grams / 100;
  
  return {
    kcal: Math.round(food.per100g.kcal * factor),
    protein: Math.round(food.per100g.protein * factor * 10) / 10,
    carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
    fats: Math.round(food.per100g.fats * factor * 10) / 10,
    fiber: Math.round(food.per100g.fiber * factor * 10) / 10,
    sodium: Math.round(food.per100g.sodium * factor),
    potassium: Math.round(food.per100g.potassium * factor),
    calcium: Math.round(food.per100g.calcium * factor),
    iron: Math.round(food.per100g.iron * factor * 10) / 10,
    vitaminC: Math.round(food.per100g.vitaminC * factor * 10) / 10,
    vitaminD: Math.round(food.per100g.vitaminD * factor * 10) / 10
  };
};

// Funzione di fallback per alimenti non trovati
export const createFallbackFood = (foodName: string, grams: number): ProcessedFood => {
  return {
    name: foodName,
    brand: undefined,
    category: 'Generale',
    barcode: undefined,
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
    tags: ['da-verificare'],
    imageUrl: undefined,
    nutritionGrade: undefined,
    novaGroup: undefined
  };
};

// Funzione per testare l'API
export const testOpenFoodFactsAPI = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Open Food Facts API...');
    const result = await searchFoodByName('pane');
    console.log('API Test Result:', result);
    return result !== null;
  } catch (error) {
    console.error('API Test Error:', error);
    return false;
  }
};

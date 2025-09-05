// Tipi per l'autenticazione
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tipi per gli alimenti
export interface Food {
  id: string;
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
  barcode?: string;
  tags: string[];
}

// Tipi per i pasti
export interface MealItem {
  foodId: string;
  foodName: string;
  food?: Food; // Opzionale per compatibilità
  grams: number;
  notes?: string;
  calculatedNutrients?: {
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
}

export interface Meal {
  id: string;
  userId: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
  completed: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Nutrienti totali del pasto
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitaminC?: number;
  vitaminD?: number;
}

// Tipi per i piani alimentari
export interface MealTemplate {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: {
    foodId: string;
    grams: number;
  }[];
}

export interface WeeklyPlan {
  monday: MealTemplate[];
  tuesday: MealTemplate[];
  wednesday: MealTemplate[];
  thursday: MealTemplate[];
  friday: MealTemplate[];
  saturday: MealTemplate[];
  sunday: MealTemplate[];
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  week: WeeklyPlan;
  targets: {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sodium: number;
    potassium: number;
  };
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

// Tipi per il tracking
export interface DailyNutrition {
  date: string;
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSodium: number;
  totalPotassium: number;
  totalCalcium: number;
  totalIron: number;
  totalVitaminC: number;
  totalVitaminD: number;
  mealsCompleted: number;
  totalMeals: number;
  completionPercentage: number;
}

export interface WeeklyNutrition {
  weekStart: string;
  weekEnd: string;
  dailyTotals: DailyNutrition[];
  weeklyAverages: {
    avgKcal: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
    avgFiber: number;
    avgSodium: number;
    avgPotassium: number;
    avgCalcium: number;
    avgIron: number;
    avgVitaminC: number;
    avgVitaminD: number;
  };
}

// Tipi per l'import CSV
export interface CsvImportData {
  date: string;
  mealType: string;
  foodName: string;
  grams: number;
}

export interface CsvImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  warnings: string[];
}

// Tipi per i filtri e la paginazione
export interface FoodFilters {
  search: string;
  category: string;
  macroDominant: 'protein' | 'carbs' | 'fats' | 'fiber' | '';
  sortBy: 'name' | 'kcal' | 'protein' | 'carbs' | 'fats';
  sortOrder: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Tipi per i form
export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
}

// Configurazione API
export const API_CONFIG = {
  NUTRITIONIX: {
    APP_ID: import.meta.env.VITE_NUTRITIONIX_APP_ID || 'a542c759',
    API_KEY: import.meta.env.VITE_NUTRITIONIX_API_KEY || 'cbd57ed5505171e56d2df780f203a9bb',
    BASE_URL: 'https://trackapi.nutritionix.com/v2'
  },
  OPENFOODFACTS: {
    BASE_URL: 'https://world.openfoodfacts.org/api/v0',
    SEARCH_URL: 'https://world.openfoodfacts.org/cgi/search.pl'
  },
  BACKEND: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }
};

// Messaggio per configurare le API
export const getApiSetupMessage = () => {
  const hasAppId = API_CONFIG.NUTRITIONIX.APP_ID && API_CONFIG.NUTRITIONIX.APP_ID !== 'your_app_id';
  const hasApiKey = API_CONFIG.NUTRITIONIX.API_KEY && API_CONFIG.NUTRITIONIX.API_KEY !== 'your_api_key';
  
  if (!hasAppId || !hasApiKey) {
    return {
      needsSetup: true,
      message: 'Per utilizzare l\'import automatico, configura le chiavi API di Nutritionix',
      steps: [
        '1. Vai su https://www.nutritionix.com/business/api',
        '2. Registrati per un account gratuito',
        '3. Ottieni App ID e API Key',
        '4. Aggiungi le variabili d\'ambiente nel file .env'
      ]
    };
  }
  return { 
    needsSetup: false,
    message: '✅ API Nutritionix configurate correttamente!',
    steps: []
  };
};

// Messaggio per Open Food Facts
export const getOpenFoodFactsMessage = () => {
  return {
    needsSetup: false,
    message: '✅ Open Food Facts API disponibile (gratuita e open source)',
    steps: []
  };
};

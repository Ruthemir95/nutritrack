const fs = require('fs');

// Leggi il database
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// Funzione per calcolare i nutrienti totali di un pasto
function calculateTotalMealNutrients(items) {
  return items.reduce((totals, item) => {
    if (item.calculatedNutrients) {
      return {
        calories: totals.calories + (item.calculatedNutrients.kcal || 0),
        protein: totals.protein + (item.calculatedNutrients.protein || 0),
        carbs: totals.carbs + (item.calculatedNutrients.carbs || 0),
        fat: totals.fat + (item.calculatedNutrients.fats || 0),
        fiber: totals.fiber + (item.calculatedNutrients.fiber || 0),
        sodium: totals.sodium + (item.calculatedNutrients.sodium || 0),
        potassium: totals.potassium + (item.calculatedNutrients.potassium || 0),
        calcium: totals.calcium + (item.calculatedNutrients.calcium || 0),
        iron: totals.iron + (item.calculatedNutrients.iron || 0),
        vitaminC: totals.vitaminC + (item.calculatedNutrients.vitaminC || 0),
        vitaminD: totals.vitaminD + (item.calculatedNutrients.vitaminD || 0),
      };
    }
    return totals;
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    vitaminC: 0,
    vitaminD: 0,
  });
}

// Aggiorna tutti i pasti
db.meals = db.meals.map(meal => {
  const totalNutrients = calculateTotalMealNutrients(meal.items);
  
  // Arrotonda i valori
  const roundedNutrients = {
    calories: Math.round(totalNutrients.calories),
    protein: Math.round(totalNutrients.protein * 10) / 10,
    carbs: Math.round(totalNutrients.carbs * 10) / 10,
    fat: Math.round(totalNutrients.fat * 10) / 10,
    fiber: Math.round(totalNutrients.fiber * 10) / 10,
    sodium: Math.round(totalNutrients.sodium * 10) / 10,
    potassium: Math.round(totalNutrients.potassium * 10) / 10,
    calcium: Math.round(totalNutrients.calcium * 10) / 10,
    iron: Math.round(totalNutrients.iron * 10) / 10,
    vitaminC: Math.round(totalNutrients.vitaminC * 10) / 10,
    vitaminD: Math.round(totalNutrients.vitaminD * 10) / 10,
  };
  
  return {
    ...meal,
    ...roundedNutrients
  };
});

// Salva il database aggiornato
fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

console.log('Database aggiornato con i nutrienti totali dei pasti!');
console.log(`Aggiornati ${db.meals.length} pasti`);

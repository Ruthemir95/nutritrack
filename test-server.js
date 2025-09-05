const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Leggi il file db.json
const dbPath = path.join(__dirname, 'db.json');
let db = {};

try {
  const data = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(data);
  console.log('Database caricato con successo');
} catch (error) {
  console.error('Errore nel caricamento del database:', error);
  process.exit(1);
}

// Endpoint per foods
app.get('/foods', (req, res) => {
  res.json(db.foods || []);
});

// Endpoint per meals
app.get('/meals', (req, res) => {
  res.json(db.meals || []);
});

// Endpoint per plans
app.get('/plans', (req, res) => {
  res.json(db.plans || []);
});

// Endpoint per users
app.get('/users', (req, res) => {
  res.json(db.users || []);
});

// POST per meals
app.post('/meals', (req, res) => {
  const newMeal = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  if (!db.meals) db.meals = [];
  db.meals.push(newMeal);
  
  // Salva nel file
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  
  res.status(201).json(newMeal);
});

// PUT per meals
app.put('/meals/:id', (req, res) => {
  const { id } = req.params;
  const mealIndex = db.meals.findIndex(meal => meal.id == id);
  
  if (mealIndex === -1) {
    return res.status(404).json({ error: 'Meal not found' });
  }
  
  db.meals[mealIndex] = { ...db.meals[mealIndex], ...req.body };
  
  // Salva nel file
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  
  res.json(db.meals[mealIndex]);
});

// DELETE per meals
app.delete('/meals/:id', (req, res) => {
  const { id } = req.params;
  const mealIndex = db.meals.findIndex(meal => meal.id == id);
  
  if (mealIndex === -1) {
    return res.status(404).json({ error: 'Meal not found' });
  }
  
  db.meals.splice(mealIndex, 1);
  
  // Salva nel file
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  
  res.status(204).send();
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
  console.log('Endpoints disponibili:');
  console.log('- GET /foods');
  console.log('- GET /meals');
  console.log('- POST /meals');
  console.log('- PUT /meals/:id');
  console.log('- DELETE /meals/:id');
  console.log('- GET /plans');
  console.log('- GET /users');
});

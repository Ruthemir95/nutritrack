import React from 'react';
import { mockNutritionDatabase } from '../services/nutritionApi';

interface MealPlanTemplateDownloaderProps {
  onDownload: () => void;
}

const MealPlanTemplateDownloader: React.FC<MealPlanTemplateDownloaderProps> = ({ onDownload }) => {
  const handleDownload = () => {
    // Usa alimenti reali dal database nutrizionale
    const templateData = [
      {
        date: '2024-01-15',
        mealType: 'breakfast',
        foodName: mockNutritionDatabase[0].name, // Yogurt greco
        grams: 150,
        notes: 'Con miele e noci'
      },
      {
        date: '2024-01-15',
        mealType: 'lunch',
        foodName: mockNutritionDatabase[1].name, // Petto di pollo
        grams: 200,
        notes: 'Grigliato con verdure'
      },
      {
        date: '2024-01-15',
        mealType: 'dinner',
        foodName: mockNutritionDatabase[2].name, // Salmone
        grams: 180,
        notes: 'Al forno con patate'
      },
      {
        date: '2024-01-15',
        mealType: 'snack',
        foodName: mockNutritionDatabase[6].name, // Mela
        grams: 120,
        notes: 'Frutta di stagione'
      },
      {
        date: '2024-01-16',
        mealType: 'breakfast',
        foodName: mockNutritionDatabase[3].name, // Avena
        grams: 80,
        notes: 'Con latte e frutti di bosco'
      },
      {
        date: '2024-01-16',
        mealType: 'lunch',
        foodName: mockNutritionDatabase[4].name, // Riso integrale
        grams: 100,
        notes: 'Con verdure miste'
      },
      {
        date: '2024-01-16',
        mealType: 'dinner',
        foodName: mockNutritionDatabase[5].name, // Uova
        grams: 120,
        notes: 'Sode con insalata'
      },
      {
        date: '2024-01-17',
        mealType: 'breakfast',
        foodName: mockNutritionDatabase[7].name, // Pane integrale
        grams: 60,
        notes: 'Con avocado e pomodoro'
      },
      {
        date: '2024-01-17',
        mealType: 'lunch',
        foodName: mockNutritionDatabase[8].name, // Tonno
        grams: 150,
        notes: 'In scatola al naturale'
      },
      {
        date: '2024-01-17',
        mealType: 'dinner',
        foodName: mockNutritionDatabase[9].name, // Quinoa
        grams: 80,
        notes: 'Con verdure saltate'
      }
    ];

    // Converti in CSV
    const csvContent = [
      'date,mealType,foodName,grams,notes',
      ...templateData.map(row => 
        `${row.date},${row.mealType},${row.foodName},${row.grams},"${row.notes}"`
      )
    ].join('\n');

    // Crea e scarica il file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'nutritrack_meal_plan_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onDownload();
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '1.5rem',
          marginRight: '0.75rem'
        }}>📅</div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          Template Piano Alimentare
        </h3>
      </div>
      
      <p style={{
        color: '#6b7280',
        marginBottom: '1rem',
        lineHeight: '1.5'
      }}>
        Scarica il template CSV per compilare il tuo piano alimentare settimanale. 
        Il file contiene esempi di pasti per 3 giorni con tutti i tipi di pasto.
      </p>
      
      <div style={{
        backgroundColor: '#f1f5f9',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#475569'
      }}>
        <strong>Struttura del file:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li><code>date</code> - Data in formato YYYY-MM-DD</li>
          <li><code>mealType</code> - Tipo pasto (breakfast, lunch, dinner, snack)</li>
          <li><code>foodName</code> - Nome dell'alimento</li>
          <li><code>grams</code> - Quantità in grammi</li>
          <li><code>notes</code> - Note opzionali</li>
        </ul>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#92400e'
      }}>
        <strong>💡 Suggerimenti:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li>Usa nomi di alimenti esistenti nel database</li>
          <li>Puoi aggiungere più pasti per lo stesso giorno</li>
          <li>Le note sono opzionali ma utili per il tracking</li>
          <li>I grammi devono essere numeri positivi</li>
        </ul>
      </div>
      
      <button
        onClick={handleDownload}
        style={{
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#7c3aed';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#8b5cf6';
        }}
      >
        <span>📥</span>
        Scarica Template Piano Alimentare
      </button>
    </div>
  );
};

export default MealPlanTemplateDownloader;

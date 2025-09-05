import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../app/hooks';
import { createMeal } from '../features/meals/mealsSlice';
import type { Meal } from '../types';

interface MealAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
}

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';

const MealAssignmentModal: React.FC<MealAssignmentModalProps> = ({
  isOpen,
  onClose,
  meal
}) => {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedDate('');
    setSelectedTime('');
    setRecurrenceType('none');
    setCustomDays([]);
    setEndDate('');
    onClose();
  }, [onClose]);

  // Gestisce la chiusura con il tasto Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Previene lo scroll del body quando la modale è aperta
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  const weekDays = [
    { id: 1, name: 'Lunedì', short: 'Lun' },
    { id: 2, name: 'Martedì', short: 'Mar' },
    { id: 3, name: 'Mercoledì', short: 'Mer' },
    { id: 4, name: 'Giovedì', short: 'Gio' },
    { id: 5, name: 'Venerdì', short: 'Ven' },
    { id: 6, name: 'Sabato', short: 'Sab' },
    { id: 0, name: 'Domenica', short: 'Dom' }
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Colazione', icon: '🌅' },
    { value: 'lunch', label: 'Pranzo', icon: '☀️' },
    { value: 'dinner', label: 'Cena', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' }
  ];

  const handleCustomDayToggle = (dayId: number) => {
    setCustomDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const generateRecurringDates = (startDate: string, recurrenceType: RecurrenceType, customDays: number[], endDate?: string) => {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 giorni
    
    switch (recurrenceType) {
      case 'daily':
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }
        break;
      case 'weekly':
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
          dates.push(d.toISOString().split('T')[0]);
        }
        break;
      case 'weekdays':
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getDay() >= 1 && d.getDay() <= 5) {
            dates.push(d.toISOString().split('T')[0]);
          }
        }
        break;
      case 'weekends':
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getDay() === 0 || d.getDay() === 6) {
            dates.push(d.toISOString().split('T')[0]);
          }
        }
        break;
      case 'custom':
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (customDays.includes(d.getDay())) {
            dates.push(d.toISOString().split('T')[0]);
          }
        }
        break;
      default:
        dates.push(startDate);
    }
    
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meal || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const dates = generateRecurringDates(selectedDate, recurrenceType, customDays, endDate || undefined);
      
      // Crea un pasto per ogni data
      for (const date of dates) {
        const newMeal: Omit<Meal, 'id'> = {
          ...meal,
          date,
          type: selectedTime as any,
          userId: 'user-1', // TODO: Usare l'ID utente corrente
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await dispatch(createMeal(newMeal)).unwrap();
      }
      
      console.log(`Pasto assegnato a ${dates.length} data/e:`, dates);
      alert(`Pasto "${meal.notes}" assegnato con successo a ${dates.length} data/e!`);
      onClose();
    } catch (error) {
      console.error('Errore nell\'assegnazione del pasto:', error);
      alert('Errore nell\'assegnazione del pasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !meal) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
            📅 Assegna Pasto al Calendario
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {meal.notes}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {meal.items.length} alimenti • {meal.items.reduce((sum, item) => sum + item.grams, 0)}g totali
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Data di inizio */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              📅 Data di inizio *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Orario */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              🕐 Orario *
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Seleziona orario</option>
              {mealTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo di ripetizione */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              🔄 Ripetizione
            </label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="none">Nessuna ripetizione</option>
              <option value="daily">Ogni giorno</option>
              <option value="weekly">Ogni settimana</option>
              <option value="weekdays">Solo giorni feriali (Lun-Ven)</option>
              <option value="weekends">Solo weekend (Sab-Dom)</option>
              <option value="custom">Giorni personalizzati</option>
            </select>
          </div>

          {/* Giorni personalizzati */}
          {recurrenceType === 'custom' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                📅 Seleziona giorni
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {weekDays.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleCustomDayToggle(day.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: customDays.includes(day.id) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      backgroundColor: customDays.includes(day.id) ? '#dbeafe' : 'white',
                      color: customDays.includes(day.id) ? '#1d4ed8' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: customDays.includes(day.id) ? '600' : '400'
                    }}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data di fine (solo se c'è ripetizione) */}
          {recurrenceType !== 'none' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                📅 Data di fine (opzionale)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={selectedDate}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Lascia vuoto per ripetere per 30 giorni
              </p>
            </div>
          )}

          {/* Anteprima */}
          {selectedDate && recurrenceType !== 'none' && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>
                📋 Anteprima assegnazioni
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                Il pasto verrà assegnato a {generateRecurringDates(selectedDate, recurrenceType, customDays, endDate || undefined).length} data/e
              </p>
            </div>
          )}

          {/* Pulsanti */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedTime}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {isSubmitting ? '⏳ Assegnazione...' : '✅ Assegna Pasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealAssignmentModal;
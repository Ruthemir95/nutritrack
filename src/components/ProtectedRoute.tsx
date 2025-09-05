import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Mostra loading mentre verifica l'autenticazione
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '3rem',
            width: '3rem',
            border: '2px solid transparent',
            borderTop: '2px solid #0ea5e9',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ color: '#374151' }}>Verifica autenticazione...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Se non autenticato, redirect al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se richiesto un ruolo specifico, verifica che l'utente lo abbia
  // Gli admin possono accedere a tutte le pagine
  if (role && user.role !== role && user.role !== 'admin') {
    // Se l'utente non ha i permessi e non è admin, redirect alla dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Se tutto ok, mostra il contenuto
  return <>{children}</>;
};

export default ProtectedRoute;

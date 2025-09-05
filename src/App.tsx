import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { checkAuth } from './features/auth/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import FoodsList from './pages/FoodsList';
import MealForm from './pages/MealForm';
import FoodForm from './pages/FoodForm';
import FoodDetail from './pages/FoodDetail';
import Admin from './pages/Admin';
import MealsManagement from './pages/MealsManagement';
import PlansPage from './pages/PlansPage';
import Dashboard from './pages/Dashboard';

// Layout components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import MealProvider from './components/MealProvider';


function App() {
  useEffect(() => {
    // Verifica autenticazione all'avvio
    store.dispatch(checkAuth());
  }, []);

  return (
    <Provider store={store}>
      <MealProvider>
        <Router>
          <div className="App">
          <Routes>
            {/* Route pubbliche */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Route protette per utenti */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="user">
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/foods" element={
              <ProtectedRoute role="user">
                <Layout>
                  <FoodsList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/foods/:id" element={
              <ProtectedRoute role="user">
                <Layout>
                  <FoodDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/foods/new" element={
              <ProtectedRoute role="admin">
                <Layout>
                  <FoodForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/foods/:id/edit" element={
              <ProtectedRoute role="admin">
                <Layout>
                  <FoodForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/meals" element={
              <ProtectedRoute role="user">
                <Layout>
                  <MealsManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/meals/new" element={
              <ProtectedRoute role="user">
                <Layout>
                  <MealForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/meals/:id/edit" element={
              <ProtectedRoute role="user">
                <Layout>
                  <MealForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/plans" element={
              <ProtectedRoute role="user">
                <Layout>
                  <PlansPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/plans/:id" element={
              <ProtectedRoute role="user">
                <Layout>
                  <PlansPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Route protette per admin */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Redirect per route non trovate */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </MealProvider>
  </Provider>
  );
}

export default App;

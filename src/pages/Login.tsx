import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginUser, clearError } from '../features/auth/authSlice';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, user, error } = useAppSelector((state: any) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect se già autenticato
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Validazione form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.password) {
      newErrors.password = 'Password è richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password deve essere di almeno 6 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione cambio input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Gestione submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap();
    } catch (error) {
      console.error('Errore durante il login:', error);
    }
  };

  // Demo credentials
  const demoCredentials = [
    { role: 'User', email: 'user@nutritrack.com', password: 'password123' },
    { role: 'Admin', email: 'admin@nutritrack.com', password: 'admin123' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <HeartIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto in NutriTrack</h1>
            <p className="text-gray-600">Accedi per gestire la tua nutrizione</p>
          </div>

          {/* Login Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error-50 border border-error-200 rounded-xl p-4 flex items-center space-x-3"
                >
                  <ExclamationTriangleIcon className="w-5 h-5 text-error-600 flex-shrink-0" />
                  <p className="text-error-700 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Email Input */}
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                placeholder="inserisci@la-tua-email.com"
                disabled={isLoading}
              />

              {/* Password Input */}
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                }
                placeholder="La tua password"
                disabled={isLoading}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                rightIcon={!isLoading ? <ArrowRightIcon className="w-5 h-5" /> : undefined}
              >
                {isLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">
                Credenziali Demo
              </h3>
              <div className="space-y-3">
                {demoCredentials.map((cred, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setFormData({
                        email: cred.email,
                        password: cred.password
                      });
                      setErrors({});
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{cred.role}</div>
                        <div className="text-sm text-gray-600">{cred.email}</div>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {cred.password}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Clicca su una credenziale per compilare automaticamente il form
              </p>
            </div>
          </Card>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: '📊', label: 'Dashboard' },
                { icon: '🍎', label: 'Alimenti' },
                { icon: '📅', label: 'Piani' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-soft"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-xs text-gray-600">{feature.label}</div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              <span>Gratuito per sempre</span>
              <span className="mx-2">•</span>
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              <span>Mobile-first</span>
              <span className="mx-2">•</span>
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              <span>Sicuro</span>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-8"
          >
            <Link 
              to="/" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              ← Torna alla home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
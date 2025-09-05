import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  HeartIcon, 
  CalendarDaysIcon, 
  DocumentArrowUpIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Home: React.FC = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Dashboard Intelligente',
      description: 'Monitora i tuoi progressi con grafici interattivi e statistiche dettagliate',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: HeartIcon,
      title: 'Database Alimenti',
      description: 'Oltre 1000 alimenti con valori nutrizionali completi e aggiornati',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: CalendarDaysIcon,
      title: 'Pianificazione Pasti',
      description: 'Crea piani settimanali personalizzati con calendario integrato',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: DocumentArrowUpIcon,
      title: 'Import CSV',
      description: 'Carica i tuoi piani alimentari esistenti con un semplice upload',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sicurezza Avanzata',
      description: 'I tuoi dati sono protetti con autenticazione sicura e ruoli utente',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile First',
      description: 'Interfaccia ottimizzata per smartphone con design moderno',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Alimenti nel database', icon: HeartIcon },
    { number: '7', label: 'Giorni di tracking', icon: CalendarDaysIcon },
    { number: '20+', label: 'Nutrienti tracciati', icon: ChartBarIcon },
    { number: '24/7', label: 'Disponibilità', icon: ShieldCheckIcon }
  ];

  const testimonials = [
    {
      name: 'Marco Rossi',
      role: 'Personal Trainer',
      content: 'NutriTrack ha rivoluzionato il modo in cui gestisco la nutrizione dei miei clienti. Interfaccia intuitiva e dati precisi.',
      rating: 5
    },
    {
      name: 'Sofia Bianchi',
      role: 'Nutrizionista',
      content: 'Finalmente un\'app che combina funzionalità avanzate con un design moderno. I miei pazienti la adorano.',
      rating: 5
    },
    {
      name: 'Luca Verdi',
      role: 'Atleta',
      content: 'Il tracking dei macronutrienti è perfetto per i miei obiettivi sportivi. Consigliatissima!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3 group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  NutriTrack
                </h1>
                <p className="text-xs text-gray-500">La tua salute in un tap</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Scopri di più
              </Button>
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Accedi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Badge variant="primary" size="lg" className="mb-4">
                🚀 Nuova versione disponibile
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Gestisci la tua
                <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Nutrizione
                </span>
                in modo intelligente
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                NutriTrack ti aiuta a monitorare i tuoi pasti, tracciare i nutrienti 
                e raggiungere i tuoi obiettivi nutrizionali con un'interfaccia moderna e intuitiva.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/login">
                <Button 
                  variant="primary" 
                  size="lg"
                  rightIcon={<ArrowRightIcon className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Inizia Gratuitamente
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="lg"
                className="w-full sm:w-auto"
              >
                Guarda Demo
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-success-500" />
                <span>Gratuito per sempre</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-success-500" />
                <span>Nessuna registrazione richiesta</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-success-500" />
                <span>Mobile-first design</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Caratteristiche Principali
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tutto quello che ti serve per gestire la tua nutrizione in un'unica app moderna e intuitiva
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-6 text-center group hover:shadow-medium transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cosa dicono i nostri utenti
            </h2>
            <p className="text-xl text-gray-600">
              Migliaia di persone hanno già scelto NutriTrack
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-warning-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Pronto a Iniziare il tuo Percorso?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Unisciti a migliaia di utenti che hanno già scelto NutriTrack per gestire la loro nutrizione in modo intelligente
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button 
                  variant="secondary" 
                  size="lg"
                  rightIcon={<ArrowRightIcon className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Inizia Gratuitamente
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="lg"
                className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-600"
              >
                Contattaci
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">NutriTrack</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                La tua app per la gestione nutrizionale intelligente. Semplice, moderna, efficace.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 NutriTrack. Progetto didattico per React e sviluppo front-end.
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
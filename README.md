# NutriTrack 🍽️

**Web App React per la gestione del piano alimentare, tracking calorie/micronutrienti e gestione dei pasti quotidiani.**

## 📋 Panoramica del Progetto

NutriTrack è un'applicazione web moderna sviluppata in React che permette agli utenti di:
- Gestire i pasti giornalieri (colazione, pranzo, cena, snack)
- Tracciare calorie, macronutrienti e micronutrienti
- Importare piani alimentari da file CSV
- Utilizzare un sistema di autenticazione con ruoli (user/admin)
- Visualizzare dashboard con progressi e statistiche

## 🎯 Obiettivo Didattico

Sviluppare un'applicazione React moderna che dimostri padronanza di:
- Componenti riusabili e conditional rendering
- Gestione dello stato (local & globale con Redux)
- Routing con pagine e route dinamiche
- Form controllati con validazione
- Integrazione di API esterne o Json Server
- Sistema di autenticazione/ruoli

## 🚀 Tecnologie Utilizzate

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + Redux Thunk
- **Routing**: React Router DOM
- **Icons**: Heroicons
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **UI Components**: Headless UI

## 📁 Struttura del Progetto

```
src/
├── app/                    # Configurazione Redux
│   ├── store.ts          # Store principale
│   └── hooks.ts          # Hooks Redux tipizzati
├── features/              # Slices Redux per feature
│   ├── auth/             # Autenticazione
│   ├── foods/            # Gestione alimenti
│   ├── meals/            # Gestione pasti
│   ├── plans/            # Gestione piani
│   └── tracking/         # Tracking nutrizionale
├── components/            # Componenti riusabili
├── pages/                 # Pagine dell'applicazione
├── services/              # Servizi API
├── types/                 # Definizioni TypeScript
└── utils/                 # Utility e helper
```

## 🛠️ Installazione e Setup

### Prerequisiti
- Node.js 18+ 
- npm o yarn

### Installazione
```bash
# Clona il repository
git clone <repository-url>
cd nutritrack

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

### Build per Produzione
```bash
npm run build
npm run preview
```

## 🔐 Credenziali Demo

### Account Admin
- **Email**: admin@nutritrack.com
- **Password**: admin123
- **Ruolo**: Admin (accesso completo)

### Account User
- **Email**: user@nutritrack.com  
- **Password**: user123
- **Ruolo**: User (accesso limitato)

### Registrazione Automatica
- Puoi usare qualsiasi email/password per creare un account user automaticamente

## 📱 Funzionalità

### ✅ Core Features
- [x] **Autenticazione e Ruoli**: Login fittizio con ruoli user/admin
- [x] **Routing**: 6+ pagine con route dinamiche
- [x] **Layout Responsive**: Header, navigazione e footer
- [x] **Gestione Stato**: Redux Toolkit per stato globale
- [x] **Form Controllati**: Login con validazione

### 🚧 In Sviluppo
- [ ] **CRUD Pasti**: Aggiunta, modifica, eliminazione pasti
- [ ] **Gestione Alimenti**: Database alimenti con nutrienti
- [ ] **Import CSV**: Caricamento piani alimentari
- [ ] **Tracking**: Dashboard con progressi e statistiche
- [ ] **Piani Settimanali**: Creazione e gestione piani
- [ ] **Area Admin**: Gestione alimenti e utenti

### 🔮 Future Features
- [ ] **Grafici**: Visualizzazioni nutrizionali
- [ ] **Notifiche**: Reminder per pasti
- [ ] **Offline**: PWA con caching
- [ ] **Temi**: Chiaro/scuro
- [ ] **Esportazione**: CSV/JSON dei dati

## 🗂️ Pagine e Routing

| Route | Pagina | Accesso | Descrizione |
|-------|--------|---------|-------------|
| `/` | Home | Pubblico | Landing page con CTA |
| `/login` | Login | Pubblico | Form di autenticazione |
| `/dashboard` | Dashboard | User/Admin | Overview nutrizionale |
| `/foods` | Lista Alimenti | User/Admin | Catalogo alimenti |
| `/foods/:id` | Dettaglio Alimento | User/Admin | Info dettagliate alimento |
| `/plans` | Lista Piani | User/Admin | Piani alimentari |
| `/plans/:id` | Dettaglio Piano | User/Admin | Dettagli piano settimanale |
| `/admin` | Area Admin | Solo Admin | Gestione sistema |

## 🔧 Configurazione

### Variabili d'Ambiente
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_NUTRITION_API_KEY=your_api_key_here
```

### Tailwind CSS
Il progetto utilizza Tailwind CSS con configurazione personalizzata per:
- Colori primari personalizzati
- Colori nutrizionali (proteine, carboidrati, grassi)
- Componenti riutilizzabili (bottoni, input, card)

## 📊 Stato del Progetto

### Milestone 1: ✅ Completata
- [x] Setup progetto React + TypeScript
- [x] Configurazione Redux Toolkit
- [x] Sistema di autenticazione
- [x] Routing e layout base
- [x] Pagina Home e Login

### Milestone 2: 🚧 In Corso
- [ ] Gestione alimenti e pasti
- [ ] CRUD operazioni
- [ ] Form con validazione

### Milestone 3: 📋 Pianificata
- [ ] Import CSV
- [ ] Tracking nutrizionale
- [ ] Dashboard e grafici

## 🧪 Testing

```bash
# Test unitari
npm run test

# Test e2e (quando implementati)
npm run test:e2e
```

## 📦 Deploy

### Build
```bash
npm run build
```

### Deploy su Vercel/Netlify
Il progetto è configurato per deploy automatico su piattaforme moderne.

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/nuova-feature`)
3. Commit delle modifiche (`git commit -am 'Aggiunge nuova feature'`)
4. Push del branch (`git push origin feature/nuova-feature`)
5. Crea una Pull Request

## 📝 Note di Sviluppo

### Best Practices Implementate
- **TypeScript**: Tipizzazione completa per type safety
- **Redux Toolkit**: Gestione stato moderna e ottimizzata
- **Componenti Riusabili**: Architettura modulare
- **Responsive Design**: Mobile-first approach
- **Accessibilità**: ARIA labels e keyboard navigation

### Struttura Redux
- **Slices**: Organizzazione per feature
- **Thunks**: Operazioni asincrone
- **Selectors**: Accesso ottimizzato allo stato
- **Normalizzazione**: Struttura dati efficiente

## 🐛 Problemi Noti

- Nessun problema critico al momento
- L'app è in fase di sviluppo attiva

## 📞 Supporto

Per domande o problemi:
- Apri una issue su GitHub
- Contatta il team di sviluppo

## 📄 Licenza

Questo progetto è sviluppato a scopo didattico per l'esame di React e sviluppo front-end.

---

**Sviluppato con ❤️ per l'apprendimento di React e TypeScript**

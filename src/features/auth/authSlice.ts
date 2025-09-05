import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../../types/index';

// Stato iniziale
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('nutritrack_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Thunk per il login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Simulazione di una chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Login fittizio - accetta qualsiasi email/password
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@nutritrack.com',
          role: 'admin',
          name: 'Admin User'
        },
        {
          id: '2',
          email: 'user@nutritrack.com',
          role: 'user',
          name: 'Regular User'
        }
      ];
      
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        // Se l'email non è nelle credenziali predefinite, crea un utente user
        const newUser: User = {
          id: Date.now().toString(),
          email: credentials.email,
          role: 'user',
          name: credentials.email.split('@')[0]
        };
        
        const token = `token_${Date.now()}`;
        localStorage.setItem('nutritrack_token', token);
        localStorage.setItem('nutritrack_user', JSON.stringify(newUser));
        
        return { user: newUser, token };
      }
      
      const token = `token_${user.id}`;
      localStorage.setItem('nutritrack_token', token);
      localStorage.setItem('nutritrack_user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      return rejectWithValue('Errore durante il login');
    }
  }
);

// Thunk per il logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('nutritrack_token');
      localStorage.removeItem('nutritrack_user');
      return true;
    } catch (error) {
      return rejectWithValue('Errore durante il logout');
    }
  }
);

// Thunk per verificare l'autenticazione
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('nutritrack_token');
      const userStr = localStorage.getItem('nutritrack_user');
      
      if (!token || !userStr) {
        throw new Error('Nessuna sessione attiva');
      }
      
      const user: User = JSON.parse(userStr);
      return { user, token };
    } catch (error) {
      return rejectWithValue('Sessione non valida');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Errore durante il login';
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

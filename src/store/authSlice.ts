import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Estado inicial: começa sem token
interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Salva o token no Redux
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },

    // Limpa o token (logout)
    clearToken(state) {
      state.token = null;
    },
  },
});

// Export das actions para usar com dispatch()
export const { setToken, clearToken } = authSlice.actions;

// Export do reducer para o store
export default authSlice.reducer;
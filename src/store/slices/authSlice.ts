import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        initializeAuth: (state) => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            if (storedUser && storedToken) {
                state.user = JSON.parse(storedUser);
                state.token = storedToken;
                state.isAuthenticated = true;
            }
        },
    },
});

export const { setUser, setToken, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer; 
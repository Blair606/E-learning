import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppRoutes from './routes';
import { initializeAuth } from './store/slices/authSlice';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
    useEffect(() => {
        // Initialize auth state from localStorage
        store.dispatch(initializeAuth());
    }, []);

    return (
        <Provider store={store}>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </Provider>
    );
};

export default App;

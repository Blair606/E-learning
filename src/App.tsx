import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
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
            <Router>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </Router>
        </Provider>
    );
};

export default App;

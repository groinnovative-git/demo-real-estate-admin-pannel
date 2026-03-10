import React, { createContext, useContext, useReducer, useEffect } from 'react';

const USERS = [
    { id: 1, email: 'admin@star.com', password: 'admin123', role: 'admin', name: 'Admin User', avatar: 'A' },
    { id: 2, email: 'manager@star.com', password: 'manager123', role: 'manager', name: 'Manager User', avatar: 'M' },
];

const AuthContext = createContext(null);

const initialState = {
    user: null,
    isAuthenticated: false,
    error: null,
};

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { user: action.payload, isAuthenticated: true, error: null };
        case 'LOGIN_ERROR':
            return { ...state, error: action.payload };
        case 'LOGOUT':
            return initialState;
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const stored = localStorage.getItem('re_admin_user');
    const [state, dispatch] = useReducer(authReducer, {
        ...initialState,
        user: stored ? JSON.parse(stored) : null,
        isAuthenticated: !!stored,
    });

    const login = (email, password) => {
        const found = USERS.find(u => u.email === email && u.password === password);
        if (found) {
            const { password: _, ...safeUser } = found;
            localStorage.setItem('re_admin_user', JSON.stringify(safeUser));
            dispatch({ type: 'LOGIN_SUCCESS', payload: safeUser });
            return true;
        } else {
            dispatch({ type: 'LOGIN_ERROR', payload: 'Invalid email or password.' });
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('re_admin_user');
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

    const isAdmin = state.user?.role === 'admin';
    const isManager = state.user?.role === 'manager';

    return (
        <AuthContext.Provider value={{ ...state, login, logout, clearError, isAdmin, isManager }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

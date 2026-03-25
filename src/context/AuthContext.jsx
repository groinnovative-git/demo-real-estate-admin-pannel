import React, { createContext, useContext, useReducer } from 'react';
import { loginUser } from '../api/authApi';

const AuthContext = createContext(null);

const initialState = {
    user:            null,
    isAuthenticated: false,
    error:           null,
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
        user:            stored ? JSON.parse(stored) : null,
        isAuthenticated: !!stored,
    });

    /**
     * Calls POST /api/Auth/Login.
     * Stores the returned token + user data in localStorage.
     * Returns { ok: true } on success, { ok: false, message } on failure.
     */
    const login = async (email, password) => {
        try {
            const response = await loginUser({ email, password });
            const data = response.data;

            // Store token if present
            const token = data?.token || data?.accessToken || data?.jwt || '';
            if (token) {
                localStorage.setItem('re_admin_token', token);
            }

            // Build a safe user object from whatever the API returns
            const safeUser = {
                id:     data?.id     || data?.userId    || '',
                email:  data?.email  || email,
                name:   data?.name   || data?.fullName  || email.split('@')[0],
                role:   (data?.role  || data?.userRole  || 'admin').toLowerCase(),
                avatar: (data?.name  || email)[0]?.toUpperCase() || 'U',
            };

            localStorage.setItem('re_admin_user', JSON.stringify(safeUser));
            dispatch({ type: 'LOGIN_SUCCESS', payload: safeUser });
            return { ok: true };
        } catch (error) {
            const status = error.response?.status;
            const serverMsg =
                error.response?.data?.message ||
                error.response?.data?.title   ||
                '';

            let message;
            switch (status) {
                case 400: message = serverMsg || 'Invalid email or password format.'; break;
                case 401: message = 'Incorrect email or password.';                  break;
                case 403: message = 'Your account does not have access.';            break;
                case 404: message = 'Account not found.';                            break;
                case 500: message = 'Server error. Please try again later.';         break;
                default:
                    message = serverMsg ||
                        (!error.response ? 'Network error. Check your connection.' : 'Login failed. Please try again.');
            }

            dispatch({ type: 'LOGIN_ERROR', payload: message });
            return { ok: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('re_admin_token');
        localStorage.removeItem('re_admin_user');
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

    const role      = state.user?.role || '';
    const isAdmin      = role === 'admin';
    const isSuperAdmin = role === 'superadmin';
    const isManager    = role === 'manager';
    const isEmployee   = role === 'employee';
    const canDelete    = ['superadmin', 'admin', 'manager'].includes(role);

    return (
        <AuthContext.Provider value={{ ...state, login, logout, clearError, isAdmin, isSuperAdmin, isManager, isEmployee, canDelete }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

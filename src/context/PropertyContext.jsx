import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockLeads } from '../data/mockData';
import * as propertyApi from '../api/propertyApi';
import { normalizeProperty } from '../utils/propertyPayloadMapper';

const PropertyContext = createContext(null);

const initialState = {
    properties: [],
    leads:      mockLeads,
    loading:    false,
    error:      null,
};

function propertyReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_PROPERTIES':
            return { ...state, properties: action.payload, loading: false, error: null };
        case 'ADD_PROPERTY':
            return { ...state, properties: [action.payload, ...state.properties] };
        case 'UPDATE_PROPERTY':
            return {
                ...state,
                properties: state.properties.map(p =>
                    p.id === action.payload.id ? action.payload : p
                ),
            };
        case 'DELETE_PROPERTY':
            return { ...state, properties: state.properties.filter(p => p.id !== action.payload) };
        case 'UPDATE_LEAD':
            return {
                ...state,
                leads: state.leads.map(l =>
                    l.id === action.payload.id ? action.payload : l
                ),
            };
        default:
            return state;
    }
}

export function PropertyProvider({ children }) {
    const [state, dispatch] = useReducer(propertyReducer, initialState);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await propertyApi.getAllProperties();
            const list     = Array.isArray(response.data) ? response.data : [];
            const normalized = list.map(normalizeProperty).filter(p => p.isActive !== false);
            dispatch({ type: 'SET_PROPERTIES', payload: normalized });
        } catch {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load properties.' });
        }
    };

    const addProperty = async (apiPayload) => {
        const response   = await propertyApi.addProperty(apiPayload);
        const normalized = normalizeProperty(response.data);
        dispatch({ type: 'ADD_PROPERTY', payload: normalized });
        return normalized;
    };

    const updateProperty = async (apiPayload) => {
        await propertyApi.updateProperty(apiPayload);
        await fetchProperties();
    };

    const deleteProperty = async (id) => {
        await propertyApi.deleteProperty(id);
        await fetchProperties();
    };

    const updateLead = (lead) => {
        dispatch({ type: 'UPDATE_LEAD', payload: lead });
    };

    const activeProperties = state.properties.filter(p => p.status !== 'sold');
    const soldProperties   = state.properties.filter(p => p.status === 'sold');

    return (
        <PropertyContext.Provider value={{
            properties:       state.properties,
            leads:            state.leads,
            loading:          state.loading,
            error:            state.error,
            activeProperties,
            soldProperties,
            addProperty,
            updateProperty,
            deleteProperty,
            updateLead,
            fetchProperties,
        }}>
            {children}
        </PropertyContext.Provider>
    );
}

export const useProperties = () => {
    const ctx = useContext(PropertyContext);
    if (!ctx) throw new Error('useProperties must be used inside PropertyProvider');
    return ctx;
};

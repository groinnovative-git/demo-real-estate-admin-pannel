import React, { createContext, useContext, useReducer } from 'react';
import { mockProperties, mockLeads } from '../data/mockData';

const PropertyContext = createContext(null);

function propertyReducer(state, action) {
    switch (action.type) {
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
    const [state, dispatch] = useReducer(propertyReducer, {
        properties: mockProperties,
        leads: mockLeads,
    });

    const addProperty = (property) => {
        const newProp = {
            ...property,
            id: Date.now(),
            status: 'active',
            listedDate: new Date().toISOString().split('T')[0],
        };
        dispatch({ type: 'ADD_PROPERTY', payload: newProp });
    };

    const updateProperty = (property) => {
        dispatch({ type: 'UPDATE_PROPERTY', payload: property });
    };

    const deleteProperty = (id) => {
        dispatch({ type: 'DELETE_PROPERTY', payload: id });
    };

    const updateLead = (lead) => {
        dispatch({ type: 'UPDATE_LEAD', payload: lead });
    };

    const activeProperties = state.properties.filter(p => p.status === 'active');
    const soldProperties = state.properties.filter(p => p.status === 'sold');

    return (
        <PropertyContext.Provider value={{
            properties: state.properties,
            leads: state.leads,
            activeProperties,
            soldProperties,
            addProperty,
            updateProperty,
            deleteProperty,
            updateLead,
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

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as propertyApi from '../api/propertyApi';
import * as leadApi from '../api/leadApi';
import { normalizeProperty } from '../utils/propertyPayloadMapper';

const PropertyContext = createContext(null);

const initialState = {
    properties: [],
    leads:      [],
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
        case 'SET_LEADS':
            return { ...state, leads: action.payload };
        case 'UPDATE_LEAD':
            return {
                ...state,
                leads: state.leads.map(l =>
                    l.contactId === action.payload.contactId ? action.payload : l
                ),
            };
        default:
            return state;
    }
}

/**
 * Normalize a raw API contact object into a consistent frontend lead shape.
 */
function normalizeLead(raw) {
    return {
        contactId:        raw.contactId        || raw.ContactId || '',
        fullName:         raw.fullName         || raw.FullName || '',
        email:            raw.email            || raw.Email || '',
        phoneNumber:      raw.phoneNumber      || raw.PhoneNumber || '',
        customerInterest: raw.customerInterest || raw.CustomerInterest || '',
        message:          raw.message          || raw.Message || '',
        propertyId:       raw.propertyId       || raw.PropertyId || '',
        leadStatus:       (raw.leadStatus      || raw.LeadStatus || 'New').trim(),
        createdDate:      raw.submittedDate    || raw.SubmittedDate || raw.createdDate || raw.CreatedDate || raw.createdAt || '',
        propertyName:     raw.propertyName     || raw.PropertyName || '',
    };
}

export function PropertyProvider({ children }) {
    const [state, dispatch] = useReducer(propertyReducer, initialState);

    useEffect(() => {
        fetchProperties();
        fetchLeads();
    }, []);

    /* ── Properties ─────────────────────────────────────────────────────── */
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

    /* ── Leads ──────────────────────────────────────────────────────────── */
    const fetchLeads = async () => {
        try {
            const response = await leadApi.getAllContacts();
            const raw = response.data;
            const list = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.data) ? raw.data
                : Array.isArray(raw?.result) ? raw.result
                : [];
            dispatch({ type: 'SET_LEADS', payload: list.map(normalizeLead) });
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        }
    };

    /**
     * Update lead status on the backend and refresh the leads list.
     */
    const updateLeadStatus = async (lead, newStatus) => {
        const payload = {
            contactId:        lead.contactId,
            fullName:         lead.fullName,
            email:            lead.email,
            phoneNumber:      lead.phoneNumber,
            customerInterest: lead.customerInterest,
            message:          lead.message,
            propertyId:       lead.propertyId || null,
            leadStatus:       newStatus,
        };
        await leadApi.updateContact(payload);
        // Optimistically update local state
        dispatch({ type: 'UPDATE_LEAD', payload: { ...lead, leadStatus: newStatus } });
    };

    /**
     * Fetch audit / status-history for a single lead.
     * API returns: { contact: {...}, auditHistory: [{ description, modifiedOn }] }
     * description format: "LeadStatus changed from 'Old' to 'New' by userId on date"
     */
    const fetchLeadAudit = async (contactId) => {
        try {
            const response = await leadApi.getContactAuditDetails(contactId);
            const raw = response.data;

            // Extract auditHistory array from response
            const history = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.auditHistory) ? raw.auditHistory
                : Array.isArray(raw?.data?.auditHistory) ? raw.data.auditHistory
                : Array.isArray(raw?.data) ? raw.data
                : [];

            // Parse each description string into structured data
            return history.map(entry => {
                const desc = entry.description || '';
                // Pattern: "LeadStatus changed from 'Old' to 'New' by <user> on <date>"
                const match = desc.match(/from\s+'([^']+)'\s+to\s+'([^']+)'\s+by\s+(.+?)\s+on\s+/i);
                return {
                    oldStatus:  match ? match[1] : '—',
                    newStatus:  match ? match[2] : '—',
                    changedBy:  entry.name || (match ? match[3] : 'System'), 
                    changedAt:  entry.modifiedOn || '',
                    rawDescription: desc,
                    name:       entry.name || '',
                    modifiedOn: entry.modifiedOn || '',
                };
            });
        } catch (err) {
            console.error('Failed to fetch audit:', err);
            return [];
        }
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
            fetchProperties,
            fetchLeads,
            updateLeadStatus,
            fetchLeadAudit,
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

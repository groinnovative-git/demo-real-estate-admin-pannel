import axiosInstance from './axiosInstance';

// ── GET all credentials ────────────────────────────────────────────────
export const getCredentials = async () => {
    // Expected response: [{ userId, username, email, password, role, isActive }, ...]
    const res = await axiosInstance.get('/api/Auth/GetUserCrediential');
    // Map backend userId to frontend id to preserve compatibility
    return (res.data || [])
        .filter(user => user.isActive) // exclude deactivated/deleted users if returning them
        .map(user => ({
            ...user,
            id: user.userId,
            emailid: user.email, // Map backend 'email' to frontend 'emailid'
            password: user.password || ''
        }));
};

// ── CREATE a credential ───────────────────────────────────────────────────────
export const createCredential = async (payload) => {
    // Payload mapping: { name, username, emailid, password, role }
    const res = await axiosInstance.post(`/api/Auth/CreateUserCrediential`, {
        name: payload.name,
        username: payload.username,
        email: payload.emailid, // Send as 'email' per swagger
        password: payload.password,
        role: payload.role
    });
    // The create response usually doesn't return the full object, or might just return a success message.
    // If it returns the object with userId, we map it. Otherwise fallback to fetch again or use a placeholder.
    if (res.data && res.data.userId) {
        return {
            ...res.data,
            id: res.data.userId,
            password: res.data.password || payload.password
        };
    }
    
    // As a fallback, since we don't know if POST returns the entity natively,
    // we return a shaped object so the UI can optimistically add it. 
    // An immediate page reload or re-fetch might be cleaner in production, 
    // but this maintains the app flow.
    return {
        id: res.data?.userId || Math.random().toString(36).substr(2, 9),
        role: payload.role,
        name: payload.name,
        username: payload.username,
        emailid: payload.emailid,
        password: payload.password,
        isActive: true
    };
};

// ── UPDATE a single credential ────────────────────────────────────────────────
export const updateCredential = async (id, payload) => {
    // Endpoint: PUT /api/Auth/UpdateUserCrediential
    // Payload: { userId, name, username, emailid, password }
    const requestPayload = {
        userId: id,
        name: payload.name,
        username: payload.username,
        email: payload.emailid, // Send as 'email' per swagger
        ...(payload.password && payload.password.trim() ? { password: payload.password } : {})
    };
    const res = await axiosInstance.put(`/api/Auth/UpdateUserCrediential`, requestPayload);
    return res.data;
};

// ── DELETE a credential ───────────────────────────────────────────────────────
export const deleteCredential = async (id) => {
    // Endpoint: POST /api/Auth/DeleteUserCrediential
    // Payload schema: { userId, isActive: <bool> }
    const requestPayload = {
        userId: id,
        isActive: false // Deactivating acts as deletion
    };
    const res = await axiosInstance.post(`/api/Auth/DeleteUserCrediential`, requestPayload);
    return res.data;
};

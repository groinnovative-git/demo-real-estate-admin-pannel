import axiosInstance from './axiosInstance';

/**
 * POST /api/Auth/Login
 * @param {{ username: string, password: string }} payload
 */
export const loginUser = (payload) =>
    axiosInstance.post('/api/Auth/Login', payload);

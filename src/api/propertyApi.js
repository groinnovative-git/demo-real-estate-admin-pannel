import axiosInstance from './axiosInstance';

/**
 * POST /api/Property/AddProperty  (multipart/form-data — backend uses IFormFileCollection)
 */
export const addProperty = (formData) =>
    axiosInstance.post('/api/Property/AddProperty', formData);

/**
 * PUT /api/Property/UpdateProperty  (multipart/form-data)
 */
export const updateProperty = (formData) =>
    axiosInstance.put('/api/Property/UpdateProperty', formData);

/**
 * GET /api/Property/GetAllProperties
 */
export const getAllProperties = () =>
    axiosInstance.get('/api/Property/GetAllProperties');

/**
 * GET /api/Property/GetPropertiesById?propertyId={uuid}
 */
export const getPropertyById = (propertyId) =>
    axiosInstance.get('/api/Property/GetPropertiesById', { params: { propertyId } });

/**
 * DELETE /api/Property/DeleteProperty?propertyId={uuid}
 */
export const deleteProperty = (propertyId) =>
    axiosInstance.delete('/api/Property/DeleteProperty', { params: { propertyId } });

/**
 * POST /api/Property/GetPropertyDashboard
 */
export const getPropertyDashboard = (payload) =>
    axiosInstance.post('/api/Property/GetPropertyDashboard', payload);

/**
 * GET /api/Property/GeCountsandDistributionByProperties
 */
export const getCountsAndDistribution = () =>
    axiosInstance.get('/api/Property/GeCountsandDistributionByProperties');

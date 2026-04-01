import axiosInstance from './axiosInstance';

/**
 * GET /api/CustomerContact/GetAllContacts
 * Returns all leads / customer contacts.
 */
export const getAllContacts = () =>
    axiosInstance.get('/api/CustomerContact/GetAllContacts');

/**
 * POST /api/CustomerContact/SubmitContact
 * Creates a new customer contact / lead.
 */
export const submitContact = (payload) =>
    axiosInstance.post('/api/CustomerContact/SubmitContact', payload);

/**
 * PUT /api/CustomerContact/UpdateContact
 * Updates an existing contact (including leadStatus changes).
 */
export const updateContact = (payload) =>
    axiosInstance.put('/api/CustomerContact/UpdateContact', payload);

/**
 * GET /api/CustomerContact/GetContactAuditDetails?contactId={uuid}
 * Returns audit / status-history entries for a given contact.
 */
export const getContactAuditDetails = (contactId) =>
    axiosInstance.get('/api/CustomerContact/GetContactAuditDetails', {
        params: { contactId },
    });

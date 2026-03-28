import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────────────────────────────────────
// CREDENTIAL API
//
// HOW TO CONNECT THE REAL API (when backend is ready):
//   1. Remove the MOCK_CREDENTIALS block and the mock functions below it.
//   2. Uncomment the real API functions (marked with ── REAL API ──).
//   3. Adjust the endpoint URLs to match your backend routes.
//   4. That's it — the UI component (CredentialManagement.jsx) needs zero changes.
// ─────────────────────────────────────────────────────────────────────────────

// ── MOCK DATA (remove when API is ready) ─────────────────────────────────────
const MOCK_CREDENTIALS = [
    { id: 'admin',    role: 'Admin',    username: 'admin@gmail.com',    password: 'Admin@2026'    },
    { id: 'manager',  role: 'Manager',  username: 'manager@gmail.com',  password: 'Manager@2026'  },
    { id: 'employee', role: 'Employee', username: 'employee@gmail.com', password: 'Employee@2026' },
];

// ── GET all credentials (mock) ────────────────────────────────────────────────
/**
 * Fetches all fixed role credentials.
 * @returns {Promise<Array<{ id, role, username, password }>>}
 */
export const getCredentials = async () => {
    // ── MOCK ── remove block below when API is ready
    await new Promise((r) => setTimeout(r, 300)); // simulate network
    return [...MOCK_CREDENTIALS];

    // ── REAL API ── uncomment when backend is ready:
    // const res = await axiosInstance.get('/api/Credentials');
    // return res.data; // expected: [{ id, role, username, password }, ...]
};

// ── UPDATE a single credential ────────────────────────────────────────────────
/**
 * Updates username and password for a given role id.
 * @param {string} id  - role id: 'admin' | 'manager' | 'employee'
 * @param {{ username: string, password: string }} payload
 * @returns {Promise<void>}
 */
export const updateCredential = async (id, payload) => {
    // ── MOCK ── remove block below when API is ready
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    return; // mock success

    // ── REAL API ── uncomment when backend is ready:
    // await axiosInstance.put(`/api/Credentials/${id}`, payload);
    //   OR
    // await axiosInstance.patch(`/api/Credentials/${id}`, payload);
};

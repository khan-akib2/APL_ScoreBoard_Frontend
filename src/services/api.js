/**
 * HTTP client — thin wrapper around fetch.
 * All API calls go through here. Import this instead of @/lib/api.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const authHeaders = () =>
  getToken() ? { Authorization: `Bearer ${getToken()}` } : {};

async function handleResponse(r) {
  if (!r.ok) {
    try {
      const err = await r.json();
      return { error: true, message: err.message || 'API Error' };
    } catch {
      return { error: true, message: `Server error: ${r.statusText}` };
    }
  }
  try {
    return await r.json();
  } catch {
    return { error: true, message: 'Invalid JSON response from server' };
  }
}

export const api = {
  get: (path) =>
    fetch(`${BASE_URL}${path}`, { headers: jsonHeaders() })
      .then(handleResponse)
      .catch(() => ({ error: true, message: 'Network Error' })),

  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    })
      .then(handleResponse)
      .catch(() => ({ error: true, message: 'Network Error' })),

  put: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    })
      .then(handleResponse)
      .catch(() => ({ error: true, message: 'Network Error' })),

  delete: (path) =>
    fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: jsonHeaders() })
      .then(handleResponse)
      .catch(() => ({ error: true, message: 'Network Error' })),

  postFormData: (path, formData) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    })
      .then(handleResponse)
      .catch(() => ({ error: true, message: 'Network Error' })),
};

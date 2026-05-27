const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.135:1000/getFullHostelDetails_1_0/1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  // Generic Fetch All
  getAll: async (resource) => {
    const response = await fetch(`${BASE_URL}/${resource}`);
    return handleResponse(response);
  },

  // Generic Create
  create: async (resource, data) => {
    const response = await fetch(`${BASE_URL}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Generic Update
  update: async (resource, id, data) => {
    const response = await fetch(`${BASE_URL}/${resource}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Generic Soft Delete
  softDelete: async (resource, id) => {
    const response = await fetch(`${BASE_URL}/${resource}/${id}`, {
      method: 'DELETE', // Assuming DELETE is handled as soft delete by backend, or could be a PUT
    });
    return handleResponse(response);
  }
};

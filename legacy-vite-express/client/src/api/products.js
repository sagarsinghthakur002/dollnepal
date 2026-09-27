import api from './client.js';

export async function fetchProducts() {
  const { data } = await api.get('/products');
  return data;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post('/products', payload, { requiresAuth: true });
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload, { requiresAuth: true });
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`, { requiresAuth: true });
  return data;
}

export async function loginAdmin(password) {
  const { data } = await api.post('/auth/login', { password });
  return data;
}

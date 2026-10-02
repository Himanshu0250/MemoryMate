import api from './api';

export const memoryService = {
  async list(params = {}) {
    const res = await api.get('/memories', { params });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/memories/${id}`);
    return res.data;
  },

  async getMemoryOfTheDay() {
    const res = await api.get('/memories/memory-of-the-day');
    return res.data;
  },

  async create(data) {
    const res = await api.post('/memories', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/memories/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/memories/${id}`);
    return res.data;
  },

  async toggleFavorite(id) {
    const res = await api.patch(`/memories/${id}/favorite`);
    return res.data;
  }
};

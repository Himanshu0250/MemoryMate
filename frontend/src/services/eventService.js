import api from './api';

export const eventService = {
  async list(params = {}) {
    const res = await api.get('/events', { params });
    return res.data;
  },

  async create(data) {
    const res = await api.post('/events', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  }
};

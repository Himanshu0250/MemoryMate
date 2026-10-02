import api from './api';

export const personService = {
  async list() {
    const res = await api.get('/people');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/people/${id}`);
    return res.data;
  },

  async create(data) {
    const res = await api.post('/people', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/people/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/people/${id}`);
    return res.data;
  },

  async generateSummary(id) {
    const res = await api.post(`/people/${id}/generate-summary`);
    return res.data;
  }
};

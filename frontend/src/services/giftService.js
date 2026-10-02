import api from './api';

export const giftService = {
  async list(params = {}) {
    const res = await api.get('/gifts', { params });
    return res.data;
  },

  async recommend(person_id, budget_range = null, occasion = null) {
    const res = await api.post('/gifts/recommend', { person_id, budget_range, occasion });
    return res.data;
  },

  async create(data) {
    const res = await api.post('/gifts', data);
    return res.data;
  },

  async togglePurchased(id) {
    const res = await api.patch(`/gifts/${id}/purchased`);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/gifts/${id}`);
    return res.data;
  }
};

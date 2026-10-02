import api from './api';

export const analyticsService = {
  async getOverview() {
    const res = await api.get('/analytics/overview');
    return res.data;
  }
};

export const notificationService = {
  async list(unreadOnly = false) {
    const res = await api.get('/notifications', { params: { unread_only: unreadOnly } });
    return res.data;
  },

  async markRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead() {
    const res = await api.post('/notifications/mark-all-read');
    return res.data;
  }
};

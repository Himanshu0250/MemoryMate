import api from './api';

export const aiService = {
  async extract(raw_text) {
    const res = await api.post('/ai/extract', { raw_text });
    return res.data;
  },

  async search(query) {
    const res = await api.post('/ai/search', { query });
    return res.data;
  },

  async chat(message, conversation_id, history = [], image_data = null) {
    const res = await api.post('/ai/chat', { message, conversation_id, history, image_data });
    return res.data;
  },

  async listConversations() {
    const res = await api.get('/ai/conversations');
    return res.data;
  },

  async getConversation(id) {
    const res = await api.get(`/ai/conversations/${id}`);
    return res.data;
  },

  async createConversation() {
    const res = await api.post('/ai/conversations');
    return res.data;
  },

  async renameConversation(id, title) {
    const res = await api.patch(`/ai/conversations/${id}`, { title });
    return res.data;
  },

  async deleteConversation(id) {
    const res = await api.delete(`/ai/conversations/${id}`);
    return res.data;
  },

  async getConnections() {
    const res = await api.get('/ai/connections');
    return res.data;
  },

  async getInsights() {
    const res = await api.get('/ai/insights');
    return res.data;
  }
};


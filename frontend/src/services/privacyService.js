import api from './api';

export const privacyService = {
  async exportData() {
    const res = await api.get('/privacy/export');
    // Trigger download in browser
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memorymate_export_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return res.data;
  },

  async wipeData() {
    const res = await api.delete('/privacy/wipe');
    return res.data;
  },

  async seedDemo() {
    const res = await api.post('/seed/demo');
    return res.data;
  }
};

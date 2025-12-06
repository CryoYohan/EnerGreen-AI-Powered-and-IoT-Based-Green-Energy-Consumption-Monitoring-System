import api from '@/services/api';

/**
 * Service for Admin-related API operations.
 * Handles utility rates, carbon rates, and user management via the backend.
 */

export const adminService = {
  // --- Rates Management ---
  async updateUtilityRate(providerId, providerName, rate) {
    return api.post('/api/admin/update-utility-rate', {
      providerId,
      providerName,
      rate
    });
  },

  async updateCarbonRate(rate) {
    return api.post('/api/admin/update-carbon-rate', { rate });
  },

  // --- Sales/Subscription Management ---
  async updateSubscription(targetUid, tier, status = 'Active') {
    return api.post('/api/admin/sales/update-subscription', {
      targetUid,
      tier,
      status
    });
  },

  // --- User Management ---
  async suspendUser(uid) {
    return api.post('/api/admin/suspend-user', { uid });
  },

  async enableUser(uid) {
    return api.post('/api/admin/enable-user', { uid });
  },

  async deleteUser(uid) {
    return api.post('/api/admin/delete-user', { uid });
  },

  async editUser(uid, updates) {
    return api.post('/api/admin/edit-user', {
      uid,
      updates
    });
  },

  // --- Feedback Management ---
  async resolveFeedback(feedbackId, userId, feedbackText) {
    return api.post('/api/admin/feedback/resolve', {
      feedbackId,
      userId,
      feedbackText
    });
  }
};

import { PopupService } from '../services/popupService';

// Debug utility functions for popups - can be called from browser console
(window as any).debugPopups = {
  // Fix expired popups by extending their expiration date
  async fixExpiredPopups() {
    console.log('Fixing expired popups...');
    await PopupService.fixExpiredPopups();
    console.log('Done! Expired popups have been extended.');
  },

  // Get all popups and their status
  async getAllPopups() {
    const popups = await PopupService.getAllPopups();
    console.log('All popups:', popups);
    return popups;
  },

  // Get only active popups
  async getActivePopups() {
    const popups = await PopupService.getActivePopups();
    console.log('Active popups:', popups);
    return popups;
  },

  // Create a test popup without expiration
  async createTestPopup() {
    const popup = {
      type: 'info' as const,
      title: 'Test Popup from Admin',
      message: 'This is a test popup created by admin - no expiration!',
      isActive: true,
      createdBy: 'admin',
      priority: 2,
    };

    const id = await PopupService.createPopup(popup);
    console.log('Created test popup with ID:', id);
    return id;
  },

  // Remove expiration from a popup
  async removeExpiration(popupId: string) {
    await PopupService.updatePopup(popupId, { expiresAt: undefined });
    console.log('Removed expiration from popup:', popupId);
  }
};

console.log('Debug functions available:');
console.log('- debugPopups.fixExpiredPopups() - Fix expired popups');
console.log('- debugPopups.getAllPopups() - Get all popups');
console.log('- debugPopups.getActivePopups() - Get active popups');
console.log('- debugPopups.createTestPopup() - Create test popup');
console.log('- debugPopups.removeExpiration(id) - Remove expiration from popup'); 
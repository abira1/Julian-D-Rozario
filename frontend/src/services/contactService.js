import { database } from '../firebase/config';
import { ref, get, set, update } from 'firebase/database';

/**
 * Contact Service for Firebase Realtime Database
 */

class ContactService {
  constructor() {
    this.contactRef = ref(database, 'contactInfo');
  }

  // Get all contact info
  async getAllContactInfo() {
    try {
      const snapshot = await get(this.contactRef);
      if (snapshot.exists()) {
        const contactObj = snapshot.val();
        return Object.keys(contactObj).map(key => ({
          id: key,
          ...contactObj[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting contact info:', error);
      throw error;
    }
  }

  // Update contact info
  async updateContactInfo(contactId, updates) {
    try {
      const contactRef = ref(database, `contactInfo/${contactId}`);
      await update(contactRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  }
}

export default new ContactService();

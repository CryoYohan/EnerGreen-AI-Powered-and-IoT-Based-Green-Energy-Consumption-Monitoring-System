import { ref, onUnmounted, watch } from 'vue';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, getDocs, writeBatch, where, doc, updateDoc } from 'firebase/firestore';

export function useNotifications(userId) {
  const notifications = ref([]);
  const isLoading = ref(true);
  const hasUnread = ref(false);

  let unsubscribe = () => {};

  // Watch for the userId to become available
  watch(() => userId.value, (newUserId) => {
    if (unsubscribe) {
      unsubscribe(); // Unsubscribe from old listener if userId changes
    }

    if (newUserId) {
      isLoading.value = true;
      const notificationsRef = collection(db, `artifacts/default-app-id/users/${newUserId}/notifications`);
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        notifications.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to JS Date
        }));
        
        // Check if there are any unread notifications
        hasUnread.value = notifications.value.some(n => !n.read);
        
        isLoading.value = false;
      }, (error) => {
        console.error("Error fetching notifications in real-time:", error);
        isLoading.value = false;
      });
    } else {
      // If no user, clear notifications
      notifications.value = [];
      hasUnread.value = false;
      isLoading.value = false;
    }
  }, { immediate: true }); // immediate: true runs the watcher right away

  const markAllAsRead = async () => {
    if (!userId.value || !hasUnread.value) return;
    
    const notificationsRef = collection(db, `artifacts/default-app-id/users/${userId.value}/notifications`);
    const q = query(notificationsRef, where('read', '==', false));
    
    try {
      const batch = writeBatch(db);
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return;

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
      console.log("All notifications marked as read.");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  
  const markAsRead = async (notificationId) => {
    if (!userId.value || !notificationId) return;

    try {
      const notificationRef = doc(db, `artifacts/default-app-id/users/${userId.value}/notifications`, notificationId);
      await updateDoc(notificationRef, { read: true });
      console.log(`Notification ${notificationId} marked as read.`);
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
    }
  };

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return { notifications, isLoading, hasUnread, markAllAsRead, markAsRead };
}

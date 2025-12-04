import { ref, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import api from '../services/api'; // Assuming you have a configured axios instance

export function useFeedback() {
  const feedback = ref([]);
  const isLoading = ref(true);
  const error = ref(null);

  const feedbackRef = collection(db, 'feedback');
  const q = query(feedbackRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    feedback.value = snapshot.docs.map(doc => {
      const data = doc.data();
      let createdAtDate = null;
      if (data.createdAt) {
        // Handle both Firestore Timestamp and ISO string formats
        if (typeof data.createdAt.toDate === 'function') {
          createdAtDate = data.createdAt.toDate();
        } else if (typeof data.createdAt === 'string') {
          createdAtDate = new Date(data.createdAt);
        }
      }
      
      // Also handle resolvedAt which might be a Timestamp
      let resolvedAtDate = data.resolvedAt;
      if (data.resolvedAt && typeof data.resolvedAt.toDate === 'function') {
        resolvedAtDate = data.resolvedAt.toDate();
      }

      return {
        id: doc.id,
        ...data,
        createdAt: createdAtDate,
        resolvedAt: resolvedAtDate,
      };
    });
    isLoading.value = false;
  }, (err) => {
    console.error("Error fetching feedback:", err);
    error.value = "Failed to fetch feedback.";
    isLoading.value = false;
  });

  const resolveFeedback = async (feedbackItem) => {
    try {
      const response = await api.post('/api/admin/feedback/resolve', {
        feedbackId: feedbackItem.id,
        userId: feedbackItem.uid,
        feedbackText: feedbackItem.text
      });
      
      if (response.data.success) {
        console.log(`Feedback ${feedbackItem.id} marked as resolved.`);
        // The real-time listener will automatically update the UI
        return { success: true };
      }
    } catch (err) {
      console.error("Error resolving feedback:", err);
      const errorMessage = err.response?.data?.error || "Could not resolve feedback.";
      return { success: false, error: errorMessage };
    }
  };

  onUnmounted(() => {
    unsubscribe();
  });

  return {
    feedback,
    isLoading,
    error,
    resolveFeedback
  };
}

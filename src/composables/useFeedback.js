import { ref, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { adminService } from '@/services/adminService';

export function useFeedback() {
  const feedback = ref([]);
  const isLoading = ref(true);
  const error = ref(null);

  const feedbackRef = collection(db, 'feedback');
  const q = query(feedbackRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    try {
      const feedbackPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        
        let createdAtDate = null;
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAtDate = data.createdAt.toDate();
          } else if (typeof data.createdAt === 'string') {
            createdAtDate = new Date(data.createdAt);
          }
        }
        
        let resolvedAtDate = data.resolvedAt;
        if (data.resolvedAt && typeof data.resolvedAt.toDate === 'function') {
          resolvedAtDate = data.resolvedAt.toDate();
        }

        // Fetch user data with the corrected path
        let fullName = 'N/A';
        if (data.uid) {
          try {
            const userProfileRef = doc(db, `artifacts/default-app-id/users/${data.uid}/userProfile/profile`);
            const userSnap = await getDoc(userProfileRef);
            if (userSnap.exists()) {
              fullName = userSnap.data().fullName || 'User Name Not Found';
            } else {
              fullName = 'User Not Found';
            }
          } catch (userError) {
            console.error(`Failed to fetch user profile for UID: ${data.uid}`, userError);
            fullName = 'Error Fetching Name';
          }
        }

        return {
          id: docSnapshot.id,
          ...data,
          createdAt: createdAtDate,
          resolvedAt: resolvedAtDate,
          fullName: fullName
        };
      });

      feedback.value = await Promise.all(feedbackPromises);
    } catch (err) {
      console.error("Error processing feedback snapshot:", err);
      error.value = "Failed to process feedback data.";
    } finally {
      isLoading.value = false;
    }
  }, (err) => {
    console.error("Error fetching feedback collection:", err);
    error.value = "Failed to fetch feedback.";
    isLoading.value = false;
  });

  const resolveFeedback = async (feedbackItem) => {
    try {
      const response = await adminService.resolveFeedback(
        feedbackItem.id,
        feedbackItem.uid,
        feedbackItem.text
      );
      
      if (response.data.success) {
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
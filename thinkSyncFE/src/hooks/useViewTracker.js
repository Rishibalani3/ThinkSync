import { useEffect } from "react";
import api from "../utils/axios"; // Use your existing axios instance

// Utility to track when a post element is visible
const useViewTracker = (postId, ref, userId, duration = 2000) => {
  useEffect(() => {
    // Only track if the user is logged in
    if (!userId || !ref.current) return;

    let intersectionTimer = null;
    let isViewRecorded = false; // Flag to prevent multiple rapid records

    const recordView = async () => {
      if (isViewRecorded) return;

      try {
        await api.post(`/posts/${postId}/view`);
        isViewRecorded = true;

        // Optional: For debugging
        // console.log(`View recorded for post: ${postId}`);
      } catch (error) {
        console.error(`Failed to record view for ${postId}:`, error);
        // Important: Do NOT stop the main app flow on this error.
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element entered viewport: start timer
          if (!intersectionTimer) {
            intersectionTimer = setTimeout(recordView, duration);
          }
        } else {
          // Element left viewport: clear timer
          if (intersectionTimer) {
            clearTimeout(intersectionTimer);
            intersectionTimer = null;
          }
        }
      },
      {
        root: null, // viewport
        rootMargin: "0px",
        threshold: 0.8, // 80% of the element must be visible
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (intersectionTimer) {
        clearTimeout(intersectionTimer);
      }
    };
  }, [postId, ref, userId, duration]);
};

export default useViewTracker;

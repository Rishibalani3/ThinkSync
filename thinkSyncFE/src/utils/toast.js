import toast from "react-hot-toast";

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      position: "bottom-right",
      style: {
        background: "#10b981",
        color: "#fff",
      },
    });
  },
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: "bottom-right",
      style: {
        background: "#ef4444",
        color: "#fff",
      },
    });
  },
  info: (message) => {
    toast(message, {
      duration: 3000,
      position: "bottom-right",
      icon: "ℹ️",
    });
  },
  loading: (message) => {
    return toast.loading(message, {
      position: "bottom-right",
    });
  },
};


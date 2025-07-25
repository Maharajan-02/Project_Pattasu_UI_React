import { toast } from "react-toastify";

export const showToast = (type, message) => {
  toast.dismiss(); // Dismiss all existing toasts
  if (type === "error") toast.error(message);
  else if (type === "warn") toast.warn(message);
  else toast.success(message);
};
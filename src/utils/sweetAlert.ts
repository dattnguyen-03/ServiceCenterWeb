import Swal from 'sweetalert2';

// Success notifications
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#10b981',
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error notifications
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
  });
};

// Warning notifications
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
  });
};

// Info notifications
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
  });
};

// Confirmation dialogs
export const showConfirm = (
  title: string,
  text: string,
  confirmText: string = 'Xác nhận',
  cancelText: string = 'Hủy'
) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  });
};

// Delete confirmation
export const showDeleteConfirm = (itemName: string = 'mục này') => {
  return Swal.fire({
    title: 'Xác nhận xóa',
    text: `Bạn có chắc chắn muốn xóa ${itemName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  });
};

// Loading spinner
export const showLoading = (title: string = 'Đang xử lý...') => {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Custom toast notifications
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon: type,
    title: message,
  });
};

// Form validation error
export const showValidationError = (errors: string[]) => {
  return Swal.fire({
    icon: 'error',
    title: 'Dữ liệu không hợp lệ',
    html: errors.map(error => `<div>• ${error}</div>`).join(''),
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
  });
};

// Network error
export const showNetworkError = () => {
  return Swal.fire({
    icon: 'error',
    title: 'Lỗi kết nối',
    text: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
  });
};

// Authentication error
export const showAuthError = () => {
  return Swal.fire({
    icon: 'warning',
    title: 'Phiên đăng nhập hết hạn',
    text: 'Vui lòng đăng nhập lại để tiếp tục.',
    confirmButtonText: 'Đăng nhập',
    confirmButtonColor: '#3b82f6',
  }).then(() => {
    // Redirect to login
    window.location.href = '/login';
  });
};

// Export sweetAlert object for backward compatibility
export const sweetAlert = {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showDeleteConfirm,
  showLoading,
  closeLoading,
  showToast,
  showValidationError,
  showNetworkError,
  showAuthError
};
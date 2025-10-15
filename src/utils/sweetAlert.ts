import Swal from 'sweetalert2';

// SweetAlert2 theme configuration
const swalTheme = {
  confirmButton: '!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !border-0 !rounded-xl !px-6 !py-3 !text-white !font-medium !shadow-lg hover:!shadow-xl transition-all duration-300',
  cancelButton: '!bg-gray-100 hover:!bg-gray-200 !border-gray-300 !text-gray-700 !rounded-xl !px-6 !py-3 !font-medium transition-all duration-300',
  denyButton: '!bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-600 hover:!to-red-700 !border-0 !rounded-xl !px-6 !py-3 !text-white !font-medium !shadow-lg hover:!shadow-xl transition-all duration-300'
};

export const sweetAlert = {
  /**
   * Hiển thị thông báo thành công
   */
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Đóng',
      customClass: {
        confirmButton: swalTheme.confirmButton,
        popup: '!rounded-2xl !shadow-2xl',
        title: '!text-gray-800 !font-bold',
        htmlContainer: '!text-gray-600'
      },
      buttonsStyling: false,
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
      }
    });
  },

  /**
   * Hiển thị thông báo lỗi
   */
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Đóng',
      customClass: {
        confirmButton: swalTheme.confirmButton,
        popup: '!rounded-2xl !shadow-2xl',
        title: '!text-gray-800 !font-bold',
        htmlContainer: '!text-gray-600'
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__shakeX animate__faster'
      }
    });
  },

  /**
   * Hiển thị thông báo cảnh báo
   */
  warning: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Đóng',
      customClass: {
        confirmButton: swalTheme.confirmButton,
        popup: '!rounded-2xl !shadow-2xl',
        title: '!text-gray-800 !font-bold',
        htmlContainer: '!text-gray-600'
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__pulse animate__faster'
      }
    });
  },

  /**
   * Hiển thị thông báo thông tin
   */
  info: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Đóng',
      customClass: {
        confirmButton: swalTheme.confirmButton,
        popup: '!rounded-2xl !shadow-2xl',
        title: '!text-gray-800 !font-bold',
        htmlContainer: '!text-gray-600'
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__bounceIn animate__faster'
      }
    });
  },

  /**
   * Hiển thị modal xác nhận với Yes/No
   */
  confirm: (title: string, text?: string, confirmText = 'Xác nhận', cancelText = 'Hủy') => {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      customClass: {
        confirmButton: swalTheme.confirmButton,
        cancelButton: swalTheme.cancelButton,
        popup: '!rounded-2xl !shadow-2xl',
        title: '!text-gray-800 !font-bold',
        htmlContainer: '!text-gray-600'
      },
      buttonsStyling: false,
      reverseButtons: true,
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      }
    });
  },

  /**
   * Hiển thị modal xác nhận xóa (danger)
   */
  confirmDelete: (title: string, text?: string, confirmText = 'Xóa', cancelText = 'Hủy') => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      customClass: {
        confirmButton: swalTheme.denyButton,
        cancelButton: swalTheme.cancelButton,
        popup: '!rounded-2xl !shadow-2xl',
        title: '!text-gray-800 !font-bold',
        htmlContainer: '!text-gray-600'
      },
      buttonsStyling: false,
      reverseButtons: true,
      showClass: {
        popup: 'animate__animated animate__shakeX animate__faster'
      }
    });
  },

  /**
   * Hiển thị loading spinner
   */
  loading: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        popup: '!rounded-2xl !shadow-2xl',
        title: '!text-gray-800 !font-bold',
        htmlContainer: '!text-gray-600'
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  /**
   * Đóng modal hiện tại
   */
  close: () => {
    Swal.close();
  },

  /**
   * Toast notification nhỏ gọn
   */
  toast: {
    success: (title: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: '!rounded-xl !shadow-lg !bg-white !border-l-4 !border-green-500'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'success',
        title
      });
    },

    error: (title: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        customClass: {
          popup: '!rounded-xl !shadow-lg !bg-white !border-l-4 !border-red-500'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'error',
        title
      });
    },

    info: (title: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: '!rounded-xl !shadow-lg !bg-white !border-l-4 !border-blue-500'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'info',
        title
      });
    },

    warning: (title: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: '!rounded-xl !shadow-lg !bg-white !border-l-4 !border-orange-500'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'warning',
        title
      });
    }
  }
};

export default sweetAlert;
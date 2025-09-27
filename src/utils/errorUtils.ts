// Error handling utilities
export const formatError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    
    // Handle API error responses
    if (errorObj.message) {
      return errorObj.message;
    }
    
    if (errorObj.error) {
      return errorObj.error;
    }
    
    // Handle validation errors
    if (errorObj.errors) {
      const validationErrors = Object.values(errorObj.errors).flat();
      return validationErrors.join(', ');
    }
  }
  
  return 'Đã xảy ra lỗi không mong muốn';
};

export const getNetworkErrorMessage = (error: unknown): string => {
  const message = formatError(error);
  
  if (message.includes('fetch')) {
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
  }
  
  if (message.includes('timeout')) {
    return 'Kết nối bị timeout. Vui lòng thử lại.';
  }
  
  return message;
};
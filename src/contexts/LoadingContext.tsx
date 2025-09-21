import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage?: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();

  const startLoading = (message?: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  };

  const withLoading = async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
    startLoading(message);
    try {
      const result = await promise;
      return result;
    } finally {
      stopLoading();
    }
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading,
        withLoading,
      }}
    >
      {children}
      {isLoading && <GlobalLoadingSpinner message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Global Loading Spinner Component
const GlobalLoadingSpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div>
            <p className="text-gray-900 font-medium">
              {message || 'Đang xử lý...'}
            </p>
            <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component for local use
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  message?: string; 
  className?: string;
}> = ({ size = 'md', message, className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mx-auto`}></div>
        {message && (
          <p className="mt-2 text-gray-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

// Button with loading state
export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  loadingText?: string;
}> = ({ 
  loading = false, 
  children, 
  onClick, 
  type = 'button',
  disabled = false,
  className = '',
  loadingText = 'Đang xử lý...'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative ${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
};
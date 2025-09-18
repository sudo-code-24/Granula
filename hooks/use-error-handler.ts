import { useCallback } from 'react';
import { ErrorHandler, showError, showSuccess, showInfo, showWarning } from '@/lib/error-handler';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    ErrorHandler.handleError(error, context);
  }, []);

  const handleDatabaseError = useCallback((error: unknown, context?: string) => {
    ErrorHandler.handleDatabaseError(error, context);
  }, []);

  const handleAuthError = useCallback((error: unknown, context?: string) => {
    ErrorHandler.handleAuthError(error, context);
  }, []);

  const handleNetworkError = useCallback((error: unknown, context?: string) => {
    ErrorHandler.handleNetworkError(error, context);
  }, []);

  const handleValidationError = useCallback((error: unknown, context?: string) => {
    ErrorHandler.handleValidationError(error, context);
  }, []);

  const success = useCallback((message: string, details?: string) => {
    showSuccess(message, details);
  }, []);

  const info = useCallback((message: string, details?: string) => {
    showInfo(message, details);
  }, []);

  const warning = useCallback((message: string, details?: string) => {
    showWarning(message, details);
  }, []);

  return {
    handleError,
    handleDatabaseError,
    handleAuthError,
    handleNetworkError,
    handleValidationError,
    success,
    info,
    warning,
  };
}

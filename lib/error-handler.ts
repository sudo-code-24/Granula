import { toast } from "sonner";

export interface ErrorDetails {
  message: string;
  code?: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ErrorHandler {
  /**
   * Handle database errors with appropriate toast notifications
   */
  static handleDatabaseError(error: unknown, context?: string): void {
    console.error('Database Error:', error);

    let errorMessage = 'A database error occurred';
    let errorDetails = 'Please try again later';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific database error types
      if (error.message.includes('connection')) {
        errorMessage = 'Database connection failed';
        errorDetails = 'Unable to connect to the database. Please check your connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout';
        errorDetails = 'The request took too long to complete. Please try again.';
      } else if (error.message.includes('constraint')) {
        errorMessage = 'Data validation error';
        errorDetails = 'The data provided violates database constraints.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Resource not found';
        errorDetails = 'The requested resource could not be found.';
      }
    }

    const contextMessage = context ? ` (${context})` : '';

    toast.error(`${errorMessage}${contextMessage}`, {
      description: errorDetails,
      duration: 5000,
    });
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: unknown, context?: string): void {
    console.error('Authentication Error:', error);

    let errorMessage = 'Authentication failed';
    let errorDetails = 'Please check your credentials and try again';

    if (error instanceof Error) {
      if (error.message.includes('invalid credentials')) {
        errorMessage = 'Invalid credentials';
        errorDetails = 'The email or password you entered is incorrect';
      } else if (error.message.includes('user not found')) {
        errorMessage = 'User not found';
        errorDetails = 'No account found with this email address';
      } else if (error.message.includes('account locked')) {
        errorMessage = 'Account locked';
        errorDetails = 'Your account has been temporarily locked. Please contact support';
      } else if (error.message.includes('email not verified')) {
        errorMessage = 'Email not verified';
        errorDetails = 'Please verify your email address before logging in';
      }
    }

    const contextMessage = context ? ` (${context})` : '';

    toast.error(`${errorMessage}${contextMessage}`, {
      description: errorDetails,
      duration: 5000,
    });
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: unknown, context?: string): void {
    console.error('Network Error:', error);

    let errorMessage = 'Network error';
    let errorDetails = 'Please check your internet connection and try again';

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Connection failed';
        errorDetails = 'Unable to connect to the server. Please check your internet connection';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout';
        errorDetails = 'The request took too long to complete';
      }
    }

    const contextMessage = context ? ` (${context})` : '';

    toast.error(`${errorMessage}${contextMessage}`, {
      description: errorDetails,
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: unknown, context?: string): void {
    console.error('Validation Error:', error);

    let errorMessage = 'Validation error';
    let errorDetails = 'Please check your input and try again';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = 'Please correct the highlighted fields';
    }

    const contextMessage = context ? ` (${context})` : '';

    toast.error(`${errorMessage}${contextMessage}`, {
      description: errorDetails,
      duration: 4000,
    });
  }

  /**
   * Handle generic errors
   */
  static handleGenericError(error: unknown, context?: string): void {
    console.error('Generic Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorDetails = 'Please try again or contact support if the problem persists';
    const contextMessage = context ? ` (${context})` : '';

    toast.error(`${errorMessage}${contextMessage}`, {
      description: errorDetails,
      duration: 5000,
    });
  }

  /**
   * Show success notifications
   */
  static showSuccess(message: string, details?: string): void {
    toast.success(message, {
      description: details,
      duration: 3000,
    });
  }

  /**
   * Show info notifications
   */
  static showInfo(message: string, details?: string): void {
    toast.info(message, {
      description: details,
      duration: 4000,
    });
  }

  /**
   * Show warning notifications
   */
  static showWarning(message: string, details?: string): void {
    toast.warning(message, {
      description: details,
      duration: 4000,
    });
  }

  /**
   * Handle any error with automatic type detection
   */
  static handleError(error: unknown, context?: string): void {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('database') || message.includes('prisma') || message.includes('sql')) {
        this.handleDatabaseError(error, context);
      } else if (message.includes('auth') || message.includes('login') || message.includes('password')) {
        this.handleAuthError(error, context);
      } else if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        this.handleNetworkError(error, context);
      } else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
        this.handleValidationError(error, context);
      } else {
        this.handleGenericError(error, context);
      }
    } else {
      this.handleGenericError(error, context);
    }
  }
}

// Convenience functions for common use cases
export const showError = (error: unknown, context?: string) => ErrorHandler.handleError(error, context);
export const showSuccess = (message: string, details?: string) => ErrorHandler.showSuccess(message, details);
export const showInfo = (message: string, details?: string) => ErrorHandler.showInfo(message, details);
export const showWarning = (message: string, details?: string) => ErrorHandler.showWarning(message, details);

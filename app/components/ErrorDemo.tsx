"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/use-error-handler';

export default function ErrorDemo() {
  const { 
    handleError, 
    handleDatabaseError, 
    handleAuthError, 
    handleNetworkError, 
    handleValidationError,
    success,
    info,
    warning 
  } = useErrorHandler();

  const simulateDatabaseError = () => {
    handleDatabaseError(new Error('Connection timeout'), 'Database Query');
  };

  const simulateAuthError = () => {
    handleAuthError(new Error('Invalid credentials'), 'Login');
  };

  const simulateNetworkError = () => {
    handleNetworkError(new Error('Failed to fetch'), 'API Request');
  };

  const simulateValidationError = () => {
    handleValidationError(new Error('Email is required'), 'Form Validation');
  };

  const simulateGenericError = () => {
    handleError(new Error('Something went wrong'), 'Generic Operation');
  };

  const showSuccessMessage = () => {
    success('Operation completed', 'Your action was successful!');
  };

  const showInfoMessage = () => {
    info('Information', 'This is an informational message');
  };

  const showWarningMessage = () => {
    warning('Warning', 'Please be careful with this action');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Error Handling Demo</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={simulateDatabaseError}
          variant="destructive"
          className="w-full"
        >
          Database Error
        </Button>
        
        <Button 
          onClick={simulateAuthError}
          variant="destructive"
          className="w-full"
        >
          Auth Error
        </Button>
        
        <Button 
          onClick={simulateNetworkError}
          variant="destructive"
          className="w-full"
        >
          Network Error
        </Button>
        
        <Button 
          onClick={simulateValidationError}
          variant="destructive"
          className="w-full"
        >
          Validation Error
        </Button>
        
        <Button 
          onClick={simulateGenericError}
          variant="destructive"
          className="w-full"
        >
          Generic Error
        </Button>
        
        <Button 
          onClick={showSuccessMessage}
          variant="default"
          className="w-full"
        >
          Success Toast
        </Button>
        
        <Button 
          onClick={showInfoMessage}
          variant="outline"
          className="w-full"
        >
          Info Toast
        </Button>
        
        <Button 
          onClick={showWarningMessage}
          variant="secondary"
          className="w-full"
        >
          Warning Toast
        </Button>
      </div>
    </div>
  );
}

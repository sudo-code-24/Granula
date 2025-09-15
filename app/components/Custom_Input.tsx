import React from 'react';

interface Custom_InputProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Custom_Input({ children, className = '' }: Custom_InputProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}
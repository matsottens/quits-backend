import * as React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', 
  color = 'primary' }: any) => {
  // Determine size based on prop
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  // Determine color based on prop
  const colorClass = color === 'primary' ? 'text-primary' : `text-${color}-500`;

  return (
    <div className="flex justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-current ${sizeClasses[size]} ${colorClass}`}></div>
    </div>
  );
};

export default LoadingSpinner; 
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  disabled = false
}: ButtonProps) {
  const variantClass = styles[`btn-${variant}`];
  const combinedClass = `${styles.btn} ${variantClass} ${className}`.trim();
  
  return (
    <button 
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}


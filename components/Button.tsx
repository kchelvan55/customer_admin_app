
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  leftIcon,
  rightIcon,
  className, 
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-neutral-darker hover:bg-neutral-light focus:ring-primary',
    success: 'bg-success text-white hover:bg-success-dark focus:ring-success',
    tertiary: 'bg-transparent text-primary border border-primary hover:bg-primary-light hover:text-white focus:ring-primary',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
};

export default Button;
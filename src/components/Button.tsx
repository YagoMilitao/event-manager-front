import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'social' | 'contained';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 text-base font-bold leading-normal tracking-[0.015em] transition-colors";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "bg-transparent text-primary border-2 border-primary/50 hover:bg-primary/10",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
    social: "text-black dark:text-white border border-black/20 dark:border-white/20 bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
    contained: "bg-primary text-white hover:bg-primary/90",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
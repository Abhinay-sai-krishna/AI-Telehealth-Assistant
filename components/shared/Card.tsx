import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  const baseClasses = "bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-700/50 overflow-hidden transition-all duration-300";
  const clickableClasses = onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : "";

  return (
    <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`relative group rounded-2xl bg-slate-800 p-1 shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      {/* Gradient Border Background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-100 blur transition-opacity duration-300"></div>
      
      {/* Inner Card Content */}
      <div className="relative h-full rounded-xl bg-slate-900 p-6">
        {title && (
          <div className="mb-4 flex items-center justify-between border-b border-slate-700/50 pb-4">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
        )}
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

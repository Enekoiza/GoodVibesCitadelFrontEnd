import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`relative group flex h-full flex-col rounded-2xl bg-slate-800 p-1 shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      {/* Gradient Border Background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-orange-500 opacity-20 group-hover:opacity-100 blur transition-opacity duration-300"></div>
      
      {/* Inner Card Content */}
      <div className="relative flex h-full flex-col rounded-xl border border-citadel-accent/40 bg-slate-900 p-6">
        {title && (
          <div className="mb-4 flex shrink-0 items-center justify-between border-b border-citadel-accent/30 pb-4">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
        )}
        <div className="min-h-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

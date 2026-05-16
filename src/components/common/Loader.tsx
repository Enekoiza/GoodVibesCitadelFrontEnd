import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative h-12 w-12">
        <div className="absolute h-full w-full rounded-full border-4 border-slate-700"></div>
        <div className="absolute h-full w-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

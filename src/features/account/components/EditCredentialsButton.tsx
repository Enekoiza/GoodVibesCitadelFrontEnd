import React from 'react';

interface EditCredentialsButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

export const EditCredentialsButton: React.FC<EditCredentialsButtonProps> = ({
  onClick,
  disabled = false,
  title = 'Editar login y contraseña',
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-cyan-400 disabled:opacity-40"
  >
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  </button>
);

import React, { useState } from 'react';
import { eyeClosedIcon, eyeOpenIcon } from './passwordRevealIcons';

interface HoldToRevealPasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export const HoldToRevealPasswordInput: React.FC<HoldToRevealPasswordInputProps> = ({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = '••••••••',
  className = '',
  'aria-label': ariaLabel = 'Contraseña del personaje',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const hide = () => setIsVisible(false);
  const show = () => {
    if (!disabled) setIsVisible(true);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onBlur?.(event.currentTarget.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-label={ariaLabel}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-2 pr-9 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60 disabled:opacity-50"
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        title="Mantén pulsado para ver la contraseña"
        aria-label="Mantén pulsado para ver la contraseña"
        onMouseDown={(event) => {
          event.preventDefault();
          show();
        }}
        onMouseUp={hide}
        onMouseLeave={hide}
        onPointerDown={(event) => {
          event.preventDefault();
          show();
        }}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-slate-500 transition-colors hover:text-slate-300 disabled:opacity-40"
      >
        {isVisible ? eyeOpenIcon : eyeClosedIcon}
      </button>
    </div>
  );
};

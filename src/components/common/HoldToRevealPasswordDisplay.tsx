import React, { useRef, useState } from 'react';
import { eyeClosedIcon, eyeOpenIcon } from './passwordRevealIcons';

interface HoldToRevealPasswordDisplayProps {
  hasPassword: boolean;
  disabled?: boolean;
  onReveal: () => Promise<string>;
  className?: string;
}

export const HoldToRevealPasswordDisplay: React.FC<HoldToRevealPasswordDisplayProps> = ({
  hasPassword,
  disabled = false,
  onReveal,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState('');
  const revealRequestId = useRef(0);

  const hiddenLabel = hasPassword ? '••••••••' : 'Sin password';

  const hide = () => {
    revealRequestId.current += 1;
    setIsVisible(false);
    setRevealedPassword('');
  };

  const show = () => {
    if (disabled || !hasPassword) return;

    const requestId = ++revealRequestId.current;
    setIsVisible(true);
    setRevealedPassword('');

    void onReveal()
      .then((password) => {
        if (revealRequestId.current !== requestId) return;
        setRevealedPassword(password);
      })
      .catch(() => {
        if (revealRequestId.current !== requestId) return;
        hide();
      });
  };

  const displayText = isVisible && revealedPassword.length > 0 ? revealedPassword : hiddenLabel;

  return (
    <div className={`relative min-w-0 flex-1 ${className}`}>
      <div
        className={`truncate rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-2 pr-9 text-sm ${
          hasPassword ? 'text-slate-400' : 'italic text-slate-600'
        }`}
      >
        {displayText}
      </div>
      {hasPassword ? (
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
          {isVisible && revealedPassword.length > 0 ? eyeOpenIcon : eyeClosedIcon}
        </button>
      ) : null}
    </div>
  );
};

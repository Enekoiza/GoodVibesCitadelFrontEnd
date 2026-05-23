import React, { useEffect, useState } from 'react';
import { HoldToRevealPasswordInput } from '../../../components/common/HoldToRevealPasswordInput';
import { validateCharacterCredentials } from '../../characters/utils/characterFields';

interface CharacterCredentialsEditorModalProps {
  characterName: string;
  initialLogin: string;
  initialHasPassword: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (login: string, password: string) => void;
}

export const CharacterCredentialsEditorModal: React.FC<CharacterCredentialsEditorModalProps> = ({
  characterName,
  initialLogin,
  initialHasPassword,
  isSaving,
  onClose,
  onSave,
}) => {
  const [login, setLogin] = useState(initialLogin);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLogin(initialLogin);
    setPassword('');
    setError(null);
  }, [initialLogin, initialHasPassword, characterName]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSaving) {
      onClose();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedLogin = login.trim();
    const validationError = validateCharacterCredentials(trimmedLogin, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (initialHasPassword && password.length === 0) {
      setError('Escribe la contraseña de nuevo para poder verla con el ojo.');
      return;
    }
    setError(null);
    onSave(trimmedLogin, password);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Credenciales del personaje</h3>
            <p className="mt-0.5 text-sm text-cyan-400">{characterName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Login
              </span>
              <input
                type="text"
                value={login}
                onChange={(event) => {
                  setLogin(event.target.value);
                  setError(null);
                }}
                placeholder="Login del juego"
                autoComplete="off"
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60 disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Password
              </span>
              <HoldToRevealPasswordInput
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setError(null);
                }}
                disabled={isSaving}
                placeholder={initialHasPassword ? 'Nueva contraseña (opcional)' : 'Password del juego'}
              />
            </label>

            <p className="text-xs text-slate-500">
              Puedes guardar solo login o login y contraseña. La contraseña sin login no está permitida.
              {initialHasPassword
                ? ' Escribe la contraseña de nuevo (no dejes el campo vacío) para poder verla con el ojo.'
                : ''}
            </p>

            {error ? (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-60"
            >
              {isSaving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

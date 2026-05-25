import React, { useState } from 'react';
import { authenticatedFetch } from '../../auth/api/authFetch';
import { useAuth } from '../../auth/context/AuthContext';

interface RegisterUserModalProps {
  onClose: () => void;
  onRegistered: () => void;
}

export const RegisterUserModal: React.FC<RegisterUserModalProps> = ({ onClose, onRegistered }) => {
  const { token, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const extractPassword = (data: unknown) => {
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.password === 'string') return record.password;
      if (typeof record.Password === 'string') return record.Password;
    }
    return '';
  };

  const handleRegister = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    setIsSaving(true);
    setError(null);
    setCopied(false);

    try {
      const response = await authenticatedFetch('/api/auth/register', token, logout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmedUsername }),
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      const password = extractPassword(data);
      if (!password) throw new Error('No se recibió la contraseña generada.');

      setGeneratedPassword(password);
      onRegistered();
    } catch (err: any) {
      setError(err.message || 'No se pudo registrar el usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!generatedPassword) return;

    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col rounded-2xl border border-citadel-accent/45 bg-slate-900 shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex items-center justify-between border-b border-citadel-accent/30 px-4 py-4 sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Registrar usuario</h3>
            <p className="mt-0.5 text-sm text-slate-500">Crea un nuevo usuario y copia su contraseña inicial.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">Nombre de usuario</span>
            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setGeneratedPassword(null);
                setCopied(false);
              }}
              placeholder="Username"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60"
            />
          </label>

          {generatedPassword && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400">Contraseña generada</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 rounded-lg bg-slate-950/60 px-3 py-2 text-sm text-slate-100">
                  {generatedPassword}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  title="Copiar contraseña"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 text-emerald-300 transition-colors hover:bg-emerald-500/15"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              {copied && <p className="mt-2 text-xs text-emerald-300">Contraseña copiada.</p>}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-citadel-accent/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            Cerrar
          </button>
          <button
            onClick={handleRegister}
            disabled={isSaving || !username.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-60"
          >
            {isSaving && (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

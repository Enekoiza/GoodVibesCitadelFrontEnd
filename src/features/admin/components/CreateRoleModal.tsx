import React, { useState } from 'react';
import { authenticatedFetch } from '../../auth/api/authFetch';
import { useAuth } from '../../auth/context/AuthContext';

interface CreateRoleModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ onClose, onCreated }) => {
  const { token, logout } = useAuth();
  const [roleName, setRoleName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setError('El nombre del rol no puede estar vacío.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const response = await authenticatedFetch(
        `/api/roles/create/${encodeURIComponent(roleName.trim())}`,
        token,
        logout,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('No se pudo crear el rol. Comprueba que el nombre no esté repetido.');
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error desconocido al crear el rol.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-sm flex-col rounded-2xl border border-citadel-accent/45 bg-slate-900 shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-citadel-accent/30 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-100">Añadir nuevo rol</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          <div>
            <label htmlFor="role-name" className="mb-2 block text-sm font-medium text-slate-300">
              Nombre del rol
            </label>
            <input
              id="role-name"
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Ej: Moderator"
              autoFocus
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-citadel-accent/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
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

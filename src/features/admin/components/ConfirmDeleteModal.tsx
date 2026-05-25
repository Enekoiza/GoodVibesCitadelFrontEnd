import React from 'react';

interface ConfirmDeleteModalProps {
  roleName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  roleName,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border border-citadel-accent/45 bg-slate-900 shadow-2xl">
        {/* Icon */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mb-4">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-100">¿Eliminar rol?</h3>
          <p className="mt-2 text-sm text-slate-400">
            Estás a punto de eliminar el rol{' '}
            <span className="font-semibold text-orange-400">"{roleName}"</span>.
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-citadel-accent/30 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:bg-red-500 disabled:opacity-60"
          >
            {isDeleting && (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

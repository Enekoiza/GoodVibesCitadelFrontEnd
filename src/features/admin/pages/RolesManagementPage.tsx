import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../../../config/api';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { CreateRoleModal } from '../components/CreateRoleModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

export const RolesManagementPage: React.FC = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRole = async (roleName: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        apiUrl(`/api/roles/delete/${encodeURIComponent(roleName)}`),
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error();
      setRoleToDelete(null);
      fetchRoles();
    } catch {
      // keep modal open on error; could add error state here if needed
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl('/api/roles/getAll'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron cargar los roles.`);
      const data: string[] = await response.json();
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido al cargar los roles.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <>
      <div className="space-y-6">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Administración de Roles</h2>
          <p className="text-slate-400">Gestiona los roles disponibles en la aplicación.</p>
        </header>

        {/* Roles card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Roles disponibles</h3>
                {!isLoading && !error && (
                  <p className="text-xs text-slate-500">{roles.length} rol{roles.length !== 1 ? 'es' : ''}</p>
                )}
              </div>
            </div>
            <button
              onClick={fetchRoles}
              disabled={isLoading}
              title="Recargar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
            >
              <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Card body */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500" />
                <p className="text-sm text-slate-500">Cargando roles...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-red-400">{error}</p>
                  <button
                    onClick={fetchRoles}
                    className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <svg className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm text-slate-500">No hay roles creados todavía.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-orange-400"
                  >
                    {role}
                    <button
                      onClick={() => setRoleToDelete(role)}
                      title={`Eliminar ${role}`}
                      className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-orange-400/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card footer */}
          <div className="flex justify-start border-t border-slate-800 px-6 py-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow transition-all hover:from-orange-400 hover:to-orange-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir nuevo rol
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchRoles}
        />
      )}

      {roleToDelete && (
        <ConfirmDeleteModal
          roleName={roleToDelete}
          isDeleting={isDeleting}
          onConfirm={() => deleteRole(roleToDelete)}
          onCancel={() => setRoleToDelete(null)}
        />
      )}
    </>
  );
};

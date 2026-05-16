import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { authenticatedFetch } from '../../../features/auth/api/authFetch';
import { fetchAllUsers, type AppUser } from '../../../features/users/api/usersApi';
import { RegisterUserModal } from './RegisterUserModal';
import { UserRolesModal } from './UserRolesModal';

export const UsersCard: React.FC = () => {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [deletingUsername, setDeletingUsername] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers(token, logout);
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (event: React.MouseEvent<HTMLButtonElement>, username: string) => {
    event.stopPropagation();
    setDeletingUsername(username);
    setDeleteError(null);

    try {
      const response = await authenticatedFetch(
        `/api/users/${encodeURIComponent(username)}/delete`,
        token,
        logout,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo eliminar el usuario.`);
      }

      await fetchUsers();
    } catch (err: any) {
      setDeleteError('No se pudo eliminar el usuario.');
    } finally {
      setDeletingUsername(null);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'CP Admin':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/20';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Usuarios</h3>
              {!isLoading && !error && (
                <p className="text-xs text-slate-500">
                  {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar usuario
            </button>
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              title="Recargar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
            >
              <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
              <p className="text-sm text-slate-500">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-red-400">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <svg className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm text-slate-500">No hay usuarios registrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {deleteError && (
                <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {deleteError}
                </p>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Usuario</th>
                    <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Roles</th>
                    <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Personajes</th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="group cursor-pointer transition-colors hover:bg-slate-800/40"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                            {user.userName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(user.roles ?? []).length > 0 ? (
                            user.roles.map((r) => (
                              <span
                                key={r}
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeStyle(r)}`}
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 italic">Sin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(user.characters ?? []).length > 0 ? (
                            user.characters.map((c, i) => (
                              <button
                                key={`${c.name}-${c.className}-${i}`}
                                type="button"
                                className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400 transition-colors hover:bg-violet-500/25 hover:border-violet-500/40 cursor-pointer"
                              >
                                {c.name}
                              </button>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 italic">Sin personajes</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => deleteUser(event, user.userName)}
                          disabled={deletingUsername === user.userName}
                          title={`Eliminar ${user.userName}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                        >
                          {deletingUsername === user.userName ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Roles modal */}
      {selectedUser && (
        <UserRolesModal
          username={selectedUser.userName}
          currentRoles={selectedUser.roles ?? []}
          characters={selectedUser.characters ?? []}
          onClose={() => setSelectedUser(null)}
          onSaved={fetchUsers}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterUserModal
          onClose={() => setIsRegisterModalOpen(false)}
          onRegistered={fetchUsers}
        />
      )}
    </>
  );
};

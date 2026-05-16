import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { fetchAllUsers, type AppUser } from '../../users/api/usersApi';

const membersIcon = (
  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export const MembersPage: React.FC = () => {
  const { token } = useAuth();
  const [members, setMembers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers(token);
      setMembers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los miembros.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Miembros</h2>
        <p className="text-slate-400">Personas registradas en Good Vibes Citadel.</p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
              {membersIcon}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-100">Miembros</h3>
              {!isLoading && !error ? (
                <p className="text-xs text-slate-500">
                  {members.length} miembro{members.length !== 1 ? 's' : ''}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadMembers()}
            disabled={isLoading}
            title="Recargar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
          >
            <svg
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
              <p className="text-sm text-slate-500">Cargando miembros...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadMembers()}
                  className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : members.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No hay miembros registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Miembros</caption>
                <thead>
                  <tr className="border-b border-slate-800">
                    <th scope="col" className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Usuario
                    </th>
                    <th scope="col" className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Personajes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-slate-800/40">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-200">{user.userName}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(user.characters ?? []).length > 0 ? (
                            user.characters.map((c, i) => (
                              <span
                                key={`${c.name}-${c.className}-${i}`}
                                className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs italic text-slate-600">Sin personajes</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { ClassPhoto } from '../../../components/common/ClassPhoto';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { Loader } from '../../../components/common/Loader';
import { hasRegisteredRoles } from '../../../constants';
import { useAuth } from '../../auth/context/AuthContext';
import { getCharacterClassName, getCharacterLevel, getCharacterName } from '../../characters/utils/characterFields';
import { fetchAllUsers, type AppUser } from '../../users/api/usersApi';

export const MembersCard: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout, roles } = useAuth();
  const canViewMembersPage = hasRegisteredRoles(roles);

  const [members, setMembers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setMembers(await fetchAllUsers(token, logout));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los miembros.');
    } finally {
      setIsLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  return (
    <div
      className={`flex h-full flex-col ${canViewMembersPage ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (canViewMembersPage) navigate('/miembros');
      }}
    >
      <Card title="Miembros" className="h-full w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Loader />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <ErrorMessage message={error} onRetry={() => void loadMembers()} />
          </div>
        ) : members.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">No hay miembros registrados.</p>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-4">
              <p className="text-sm text-slate-400">
                {members.length} miembro{members.length !== 1 ? 's' : ''} en la CP
              </p>
            </div>

            <ul
              className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-2"
              onClick={(e) => e.stopPropagation()}
            >
              {members.map((user) => (
                <li
                  key={user.id}
                  className="rounded-xl border border-transparent bg-slate-800/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-slate-300">
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="min-w-0 truncate text-sm font-medium text-slate-200">{user.userName}</p>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5 pl-12">
                    {(user.characters ?? []).length > 0 ? (
                      user.characters.map((character, index) => {
                        const name = getCharacterName(character);
                        const className = getCharacterClassName(character);
                        const level = getCharacterLevel(character);

                        return (
                          <span
                            key={`${name}-${className}-${level}-${index}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/15 py-0.5 pl-1 pr-2.5 text-xs font-semibold text-violet-400"
                          >
                            <ClassPhoto classNameValue={className} alt={name || className} size="sm" />
                            {name}
                            <span className="text-violet-300/80">· {level}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs italic text-slate-600">Sin personajes</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

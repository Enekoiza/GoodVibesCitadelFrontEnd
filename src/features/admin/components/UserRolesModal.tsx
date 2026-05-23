import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../../auth/api/authFetch';
import { useAuth } from '../../auth/context/AuthContext';
import { HoldToRevealPasswordInput } from '../../../components/common/HoldToRevealPasswordInput';
import { CLASS_NAMES } from '../../characters/constants/classNames';
import {
  clampCharacterLevel,
  getCharacterClassName,
  getCharacterLevel,
  getCharacterLogin,
  getCharacterName,
  getCharacterPassword,
  characterPasswordForUpdate,
  MAX_CHARACTER_LEVEL,
  MIN_CHARACTER_LEVEL,
} from '../../characters/utils/characterFields';
import type { UserCharacterRow } from '../../users/api/usersApi';

interface UserRolesModalProps {
  username: string;
  currentRoles: string[];
  characters: UserCharacterRow[];
  onClose: () => void;
  onSaved: () => void;
}

export const UserRolesModal: React.FC<UserRolesModalProps> = ({
  username,
  currentRoles,
  characters,
  onClose,
  onSaved,
}) => {
  const { token, logout } = useAuth();
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(currentRoles));
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editableCharacters, setEditableCharacters] = useState<UserCharacterRow[]>(characters);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterClass, setNewCharacterClass] = useState('AbyssWalker');
  const [newCharacterLevel, setNewCharacterLevel] = useState(MIN_CHARACTER_LEVEL);
  const [newCharacterLogin, setNewCharacterLogin] = useState('');
  const [newCharacterPassword, setNewCharacterPassword] = useState('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  // Fetch all available roles
  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    setRolesError(null);
    try {
      const response = await authenticatedFetch('/api/roles/getAll', token, logout);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data: string[] = await response.json();
      setAllRoles(data);
    } catch (err: any) {
      setRolesError('No se pudieron cargar los roles.');
    } finally {
      setIsLoadingRoles(false);
    }
  }, [logout, token]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    setEditableCharacters(characters);
  }, [characters]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const newCharacter: UserCharacterRow[] = newCharacterName.trim()
        ? [
            {
              name: newCharacterName.trim(),
              className: newCharacterClass,
              level: clampCharacterLevel(newCharacterLevel),
              login: newCharacterLogin.trim(),
              passwordChange: newCharacterPassword.length > 0 ? newCharacterPassword : undefined,
            },
          ]
        : [];
      const updatedCharacters = [...editableCharacters, ...newCharacter];

      const rolesResponse = await authenticatedFetch(
        `/api/users/${encodeURIComponent(username)}/roles/assignMultiple`,
        token,
        logout,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            roles: Array.from(selectedRoles),
          }),
        }
      );
      if (!rolesResponse.ok) throw new Error(`Error ${rolesResponse.status}`);

      const charactersResponse = await authenticatedFetch(
        `/api/users/${encodeURIComponent(username)}/character/updateCharacterList`,
        token,
        logout,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Username: username,
            Characters: updatedCharacters.map((character) => {
              const password = characterPasswordForUpdate(character);
              return {
                Name: getCharacterName(character),
                ClassName: getCharacterClassName(character),
                ClassType:
                  (character as UserCharacterRow).type ??
                  (character as UserCharacterRow).Type ??
                  (character as UserCharacterRow).classType ??
                  (character as UserCharacterRow).ClassType ??
                  '',
                Level: getCharacterLevel(character),
                Login: getCharacterLogin(character),
                ...(password !== undefined ? { Password: password } : {}),
              };
            }),
          }),
        }
      );
      if (!charactersResponse.ok) {
        const errorBody = (await charactersResponse.json().catch(() => null)) as {
          message?: string;
          Message?: string;
        } | null;
        throw new Error(
          errorBody?.message ??
            errorBody?.Message ??
            `Error ${charactersResponse.status}: No se pudieron guardar los personajes.`
        );
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : 'No se pudieron guardar los cambios. Inténtalo de nuevo.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Gestionar Miembro</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="font-medium text-cyan-400">{username}</span>
            </p>
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

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          <div>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
              </div>
            ) : rolesError ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {rolesError}
              </div>
            ) : (
              <>
                <p className="mb-4 text-xs text-slate-500 uppercase tracking-wider font-medium">Roles disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {allRoles.map((role) => {
                    const active = selectedRoles.has(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                          active
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        {active && (
                          <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {role}
                        {active && (
                          <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-red-500/30 hover:text-red-400 transition-colors">
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-slate-800 pt-5">
            <p className="mb-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Personajes del miembro</p>
            <div className="overflow-visible rounded-lg border border-slate-800">
              <table className="w-full min-w-[48rem] text-sm">
                <thead className="bg-slate-900/95">
                  <tr className="border-b border-slate-800">
                    <th className="w-10 px-3 py-2" />
                    <th className="w-12 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">#</th>
                    <th className="min-w-0 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Personaje</th>
                    <th className="min-w-0 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Clase</th>
                    <th className="w-24 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Nivel</th>
                    <th className="min-w-[7rem] px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Login</th>
                    <th className="min-w-[9rem] px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {editableCharacters.map((char, index) => (
                    <tr key={`${getCharacterName(char)}-${getCharacterClassName(char)}-${index}`} className="bg-slate-900/30">
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setEditableCharacters((current) => current.filter((_, i) => i !== index))}
                          title="Eliminar personaje"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 tabular-nums">{index + 1}</td>
                      <td className="min-w-0 px-3 py-2.5 font-medium text-slate-200">
                        <span className="block break-words">{getCharacterName(char)}</span>
                      </td>
                      <td className="min-w-0 px-3 py-2.5 text-slate-300">
                        <div className="flex min-w-0 items-center gap-2">
                          <img
                            src={`/ClassPhotos/${getCharacterClassName(char)}.png`}
                            alt={getCharacterClassName(char)}
                            className="h-6 w-6 shrink-0 rounded object-cover"
                          />
                          <span className="min-w-0 break-words">{getCharacterClassName(char)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          min={MIN_CHARACTER_LEVEL}
                          max={MAX_CHARACTER_LEVEL}
                          value={getCharacterLevel(char)}
                          onChange={(event) => {
                            const level = clampCharacterLevel(
                              Number.parseInt(event.target.value, 10) || MIN_CHARACTER_LEVEL
                            );
                            setEditableCharacters((current) =>
                              current.map((item, i) => (i === index ? { ...item, level } : item))
                            );
                          }}
                          className="input-no-spin w-20 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-sm tabular-nums text-slate-200 outline-none transition-colors focus:border-cyan-500/60"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={getCharacterLogin(char)}
                          onChange={(event) => {
                            const login = event.target.value;
                            setEditableCharacters((current) =>
                              current.map((item, i) => (i === index ? { ...item, login } : item))
                            );
                          }}
                          placeholder="Login"
                          autoComplete="off"
                          className="w-full min-w-[6rem] rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <HoldToRevealPasswordInput
                          value={getCharacterPassword(char)}
                          onChange={(password) => {
                            setEditableCharacters((current) =>
                              current.map((item, i) => (i === index ? { ...item, password } : item))
                            );
                          }}
                          placeholder="Password"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-950/30">
                    <td className="px-3 py-2.5" />
                    <td className="px-3 py-2.5 text-slate-600 tabular-nums">{editableCharacters.length + 1}</td>
                    <td className="min-w-0 px-3 py-2.5">
                      <input
                        type="text"
                        value={newCharacterName}
                        onChange={(event) => setNewCharacterName(event.target.value)}
                        placeholder="Nombre del personaje"
                        className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60"
                      />
                    </td>
                    <td className="relative min-w-0 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setIsClassDropdownOpen((open) => !open)}
                        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:border-slate-600"
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <img
                            src={`/ClassPhotos/${newCharacterClass}.png`}
                            alt={newCharacterClass}
                            className="h-6 w-6 shrink-0 rounded object-cover"
                          />
                          <span className="min-w-0 break-words">{newCharacterClass}</span>
                        </span>
                        <svg className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isClassDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 min-w-0 overflow-y-auto overflow-x-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl">
                          {CLASS_NAMES.map((className) => (
                            <button
                              key={className}
                              type="button"
                              onClick={() => {
                                setNewCharacterClass(className);
                                setIsClassDropdownOpen(false);
                              }}
                              className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                className === newCharacterClass
                                  ? 'bg-cyan-500/10 text-cyan-300'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <img
                                src={`/ClassPhotos/${className}.png`}
                                alt={className}
                                className="h-6 w-6 shrink-0 rounded object-cover"
                              />
                              <span className="min-w-0 flex-1 break-words">{className}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min={MIN_CHARACTER_LEVEL}
                        max={MAX_CHARACTER_LEVEL}
                        value={newCharacterLevel}
                        onChange={(event) =>
                          setNewCharacterLevel(
                            clampCharacterLevel(Number.parseInt(event.target.value, 10) || MIN_CHARACTER_LEVEL)
                          )
                        }
                        className="input-no-spin w-20 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-sm tabular-nums text-slate-200 outline-none transition-colors focus:border-cyan-500/60"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={newCharacterLogin}
                        onChange={(event) => setNewCharacterLogin(event.target.value)}
                        placeholder="Login"
                        autoComplete="off"
                        className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <HoldToRevealPasswordInput
                        value={newCharacterPassword}
                        onChange={setNewCharacterPassword}
                        placeholder="Password"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {saveError && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoadingRoles}
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

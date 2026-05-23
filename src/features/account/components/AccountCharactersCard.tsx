import React, { useCallback, useEffect, useState } from 'react';
import { ClassPhoto } from '../../../components/common/ClassPhoto';
import { HoldToRevealPasswordDisplay } from '../../../components/common/HoldToRevealPasswordDisplay';
import { HoldToRevealPasswordInput } from '../../../components/common/HoldToRevealPasswordInput';
import { CLASS_NAMES } from '../../characters/constants/classNames';
import {
  clampCharacterLevel,
  formatCharacterLoginDisplay,
  getCharacterClassName,
  getCharacterLevel,
  getCharacterHasPassword,
  getCharacterLogin,
  getCharacterName,
  MAX_CHARACTER_LEVEL,
  MIN_CHARACTER_LEVEL,
  validateCharacterCredentials,
} from '../../characters/utils/characterFields';
import { useAuth } from '../../auth/context/AuthContext';
import type { UserCharacterRow } from '../../users/api/usersApi';
import {
  fetchMyCharacterPassword,
  fetchMyCharacters,
  updateMyCharacterCredentials,
  updateMyCharacters,
} from '../api/charactersApi';
import { CharacterCredentialsEditorModal } from './CharacterCredentialsEditorModal';
import { EditCredentialsButton } from './EditCredentialsButton';

export const AccountCharactersCard: React.FC = () => {
  const { token, logout } = useAuth();
  const [characters, setCharacters] = useState<UserCharacterRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterClass, setNewCharacterClass] = useState<string>(CLASS_NAMES[0]);
  const [newCharacterLevel, setNewCharacterLevel] = useState(MIN_CHARACTER_LEVEL);
  const [newCharacterLogin, setNewCharacterLogin] = useState('');
  const [newCharacterPassword, setNewCharacterPassword] = useState('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [editingCredentialsIndex, setEditingCredentialsIndex] = useState<number | null>(null);

  const loadCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCharacters(await fetchMyCharacters(token, logout));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus personajes.');
    } finally {
      setIsLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    void loadCharacters();
  }, [loadCharacters]);

  const persistCharacters = async (nextCharacters: UserCharacterRow[]) => {
    setIsSaving(true);
    setError(null);
    try {
      await updateMyCharacters(nextCharacters, token, logout);
      setCharacters(await fetchMyCharacters(token, logout));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el personaje.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (index: number) => {
    const nextCharacters = characters.filter((_, i) => i !== index);
    try {
      await persistCharacters(nextCharacters);
    } catch {
      /* error shown in state */
    }
  };

  const handleLevelBlur = async (index: number, rawLevel: string) => {
    const level = clampCharacterLevel(Number.parseInt(rawLevel, 10) || MIN_CHARACTER_LEVEL);
    if (level === getCharacterLevel(characters[index])) return;

    const nextCharacters = characters.map((character, i) =>
      i === index ? { ...character, level } : character
    );

    try {
      await persistCharacters(nextCharacters);
    } catch {
      await loadCharacters();
    }
  };

  const handleSaveCredentials = async (index: number, login: string, password: string) => {
    const characterName = getCharacterName(characters[index]);
    setIsSaving(true);
    setError(null);

    try {
      await updateMyCharacterCredentials(
        characterName,
        login,
        password.length > 0 ? password : undefined,
        token,
        logout
      );
      setCharacters(await fetchMyCharacters(token, logout));
      setEditingCredentialsIndex(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar las credenciales.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = newCharacterName.trim();
    if (!trimmedName) return;

    const trimmedLogin = newCharacterLogin.trim();
    const credentialsError = validateCharacterCredentials(trimmedLogin, newCharacterPassword);
    if (credentialsError) {
      setError(credentialsError);
      return;
    }

    const nextCharacters: UserCharacterRow[] = [
      ...characters,
      {
        name: trimmedName,
        className: newCharacterClass,
        level: clampCharacterLevel(newCharacterLevel),
        login: trimmedLogin,
        passwordChange: newCharacterPassword.length > 0 ? newCharacterPassword : undefined,
      },
    ];

    try {
      await persistCharacters(nextCharacters);
      setNewCharacterName('');
      setNewCharacterLevel(MIN_CHARACTER_LEVEL);
      setNewCharacterLogin('');
      setNewCharacterPassword('');
      setIsClassDropdownOpen(false);
    } catch {
      /* error shown in state */
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
      <div className="border-b border-slate-800 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-100">Mis personajes</h3>
        <p className="mt-0.5 text-xs text-slate-500">Personajes registrados a tu nombre en el clan.</p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
            <p className="text-sm text-slate-500">Cargando personajes...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-sm">
                <caption className="sr-only">Personajes del usuario</caption>
                <thead>
                  <tr className="border-b border-slate-800">
                    <th scope="col" className="w-10 pb-3" />
                    <th
                      scope="col"
                      className="pb-3 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      Personaje
                    </th>
                    <th
                      scope="col"
                      className="pb-3 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      Clase
                    </th>
                    <th
                      scope="col"
                      className="w-20 pb-3 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      Nivel
                    </th>
                    <th
                      scope="col"
                      className="min-w-[8rem] pb-3 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      Login
                    </th>
                    <th
                      scope="col"
                      className="min-w-[10rem] pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      Password
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {characters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm italic text-slate-600">
                        Aún no tienes personajes registrados.
                      </td>
                    </tr>
                  ) : (
                    characters.map((character, index) => {
                      const name = getCharacterName(character);
                      const className = getCharacterClassName(character);
                      const level = getCharacterLevel(character);
                      const login = getCharacterLogin(character);
                      const hasPassword = getCharacterHasPassword(character);
                      return (
                        <tr key={`${name}-${className}-${index}`} className="transition-colors hover:bg-slate-800/30">
                          <td className="py-3 pl-1">
                            <button
                              type="button"
                              onClick={() => void handleRemove(index)}
                              disabled={isSaving}
                              title={`Eliminar ${name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="py-3 pr-3 font-medium text-slate-200">{name}</td>
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2 text-slate-300">
                              <ClassPhoto classNameValue={className} alt={name} size="sm" />
                              <span>{className}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <input
                              type="number"
                              min={MIN_CHARACTER_LEVEL}
                              max={MAX_CHARACTER_LEVEL}
                              defaultValue={level}
                              key={`${name}-level-${level}`}
                              disabled={isSaving}
                              onBlur={(event) => void handleLevelBlur(index, event.target.value)}
                              className="input-no-spin w-20 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-sm tabular-nums text-slate-200 outline-none transition-colors focus:border-cyan-500/60 disabled:opacity-50"
                            />
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`min-w-0 truncate ${login ? 'text-slate-300' : 'italic text-slate-600'}`}
                              >
                                {formatCharacterLoginDisplay(login)}
                              </span>
                              <EditCredentialsButton
                                disabled={isSaving}
                                onClick={() => setEditingCredentialsIndex(index)}
                              />
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-between gap-2">
                              <HoldToRevealPasswordDisplay
                                hasPassword={hasPassword}
                                disabled={isSaving}
                                onReveal={async () => {
                                  try {
                                    return await fetchMyCharacterPassword(name, token, logout);
                                  } catch (err: unknown) {
                                    setError(
                                      err instanceof Error
                                        ? err.message
                                        : 'No se pudo mostrar la contraseña.'
                                    );
                                    throw err;
                                  }
                                }}
                              />
                              <EditCredentialsButton
                                disabled={isSaving}
                                onClick={() => setEditingCredentialsIndex(index)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleRegister} className="mt-6 border-t border-slate-800 pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Registrar personaje
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:items-end">
                <label className="block min-w-0">
                  <span className="mb-2 block text-xs text-slate-500">Nombre</span>
                  <input
                    type="text"
                    value={newCharacterName}
                    onChange={(event) => setNewCharacterName(event.target.value)}
                    placeholder="Nombre del personaje"
                    disabled={isSaving}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60 disabled:opacity-50"
                  />
                </label>

                <div className="relative min-w-0">
                  <span className="mb-2 block text-xs text-slate-500">Clase</span>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsClassDropdownOpen((open) => !open)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:border-slate-600 disabled:opacity-50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ClassPhoto classNameValue={newCharacterClass} alt={newCharacterClass} size="sm" />
                      <span className="truncate">{newCharacterClass}</span>
                    </span>
                    <svg
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isClassDropdownOpen ? (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl">
                      {CLASS_NAMES.map((className) => (
                        <button
                          key={className}
                          type="button"
                          onClick={() => {
                            setNewCharacterClass(className);
                            setIsClassDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                            className === newCharacterClass
                              ? 'bg-cyan-500/10 text-cyan-300'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <ClassPhoto classNameValue={className} alt={className} size="sm" />
                          <span>{className}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <label className="block min-w-0">
                  <span className="mb-2 block text-xs text-slate-500">Nivel</span>
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
                    disabled={isSaving}
                    className="input-no-spin w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm tabular-nums text-slate-200 outline-none transition-colors focus:border-cyan-500/60 disabled:opacity-50"
                  />
                </label>

                <label className="block min-w-0">
                  <span className="mb-2 block text-xs text-slate-500">Login</span>
                  <input
                    type="text"
                    value={newCharacterLogin}
                    onChange={(event) => setNewCharacterLogin(event.target.value)}
                    placeholder="Login del juego"
                    disabled={isSaving}
                    autoComplete="off"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60 disabled:opacity-50"
                  />
                </label>

                <label className="block min-w-0">
                  <span className="mb-2 block text-xs text-slate-500">Password</span>
                  <HoldToRevealPasswordInput
                    value={newCharacterPassword}
                    onChange={setNewCharacterPassword}
                    disabled={isSaving}
                    placeholder="Password del juego"
                    className="w-full"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSaving || !newCharacterName.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-60 xl:mb-0"
                >
                  {isSaving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : null}
                  Registrar
                </button>
              </div>
            </form>
          </>
        )}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        ) : null}
      </div>

      {editingCredentialsIndex !== null && characters[editingCredentialsIndex] ? (
        <CharacterCredentialsEditorModal
          characterName={getCharacterName(characters[editingCredentialsIndex])}
          initialLogin={getCharacterLogin(characters[editingCredentialsIndex])}
          initialHasPassword={getCharacterHasPassword(characters[editingCredentialsIndex])}
          isSaving={isSaving}
          onClose={() => setEditingCredentialsIndex(null)}
          onSave={(login, password) => void handleSaveCredentials(editingCredentialsIndex, login, password)}
        />
      ) : null}
    </div>
  );
};

export default AccountCharactersCard;

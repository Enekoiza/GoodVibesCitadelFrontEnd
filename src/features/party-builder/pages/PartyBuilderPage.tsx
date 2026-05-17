import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  fetchPartyCompositions,
  PARTY_TYPES,
  validatePartyComposition,
  type CompositionDto,
  type PartyType,
} from '../api/partyBuilderApi';
import { fetchAllUsers, type AppUser, type UserCharacterRow } from '../../users/api/usersApi';

const partyBuilderIcon = (
  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h3m5-10a4 4 0 110 8 4 4 0 010-8zM7 8a3 3 0 110 6 3 3 0 010-6zm10 0a3 3 0 110 6 3 3 0 010-6z"
    />
  </svg>
);

const refreshIconPath = (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
);

const roleCountFields = [
  { key: 'dpsCount', label: 'dps', className: 'border-red-500/20 bg-red-500/15 text-red-400' },
  { key: 'bishopCount', label: 'bishop', className: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-400' },
  { key: 'bardCount', label: 'bard', className: 'border-violet-500/20 bg-violet-500/15 text-violet-400' },
  { key: 'bufferCount', label: 'buffer', className: 'border-amber-500/20 bg-amber-500/15 text-amber-400' },
  { key: 'tankCount', label: 'tank', className: 'border-cyan-500/20 bg-cyan-500/15 text-cyan-400' },
  { key: 'rechargerCount', label: 'recharger', className: 'border-blue-500/20 bg-blue-500/15 text-blue-400' },
] as const;

type RoleCountKey = (typeof roleCountFields)[number]['key'];
type RoleCounts = Record<RoleCountKey, number>;

const getCompositionRoleTags = (composition: CompositionDto) =>
  roleCountFields
    .map((field) => ({
      ...field,
      count: composition[field.key as RoleCountKey],
    }))
    .filter((field) => field.count > 0);

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Error desconocido.';

const getCharacterName = (character: UserCharacterRow) => character.name ?? character.Name ?? '';

const getCharacterClassName = (character: UserCharacterRow) => character.className ?? character.ClassName ?? '';

const getCharacterType = (character: UserCharacterRow) =>
  character.type ?? character.Type ?? character.classType ?? character.ClassType ?? '';

const isCharacterForRole = (character: UserCharacterRow, role: string) =>
  getCharacterType(character).trim().toLowerCase() === role.trim().toLowerCase();

const classPhotoExtensions = ['png', 'jpg', 'jpeg', 'webp'] as const;

const getClassPhotoUrl = (className: string, extensionIndex: number) =>
  `/ClassPhotos/${encodeURIComponent(className)}.${classPhotoExtensions[extensionIndex]}`;

const selectClassName =
  'w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950/80 py-2 pl-3 pr-8 text-xs font-medium text-slate-200 shadow-sm focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50';

const ClassPhoto: React.FC<{ classNameValue: string; alt: string }> = ({ classNameValue, alt }) => {
  const [extensionIndex, setExtensionIndex] = useState(0);

  if (!classNameValue || extensionIndex >= classPhotoExtensions.length) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-500">
        ?
      </span>
    );
  }

  return (
    <img
      src={getClassPhotoUrl(classNameValue, extensionIndex)}
      alt={alt}
      className="h-6 w-6 shrink-0 rounded-full border border-slate-700 object-cover"
      onError={() => setExtensionIndex((current) => current + 1)}
    />
  );
};

interface PartySlot {
  role: string;
  roleClassName: string;
  userId: string;
  characterName: string;
}

const emptyRoleCounts = roleCountFields.reduce(
  (counts, field) => ({ ...counts, [field.key]: 0 }),
  {} as RoleCounts
);

const buildSlotsFromRoleCounts = (counts: RoleCounts): PartySlot[] =>
  roleCountFields.flatMap((field) =>
    Array.from({ length: counts[field.key] }, () => ({
      role: field.label,
      roleClassName: field.className,
      userId: '',
      characterName: '',
    }))
  );

const buildSlotsFromComposition = (composition: CompositionDto): PartySlot[] =>
  buildSlotsFromRoleCounts(
    roleCountFields.reduce(
      (counts, field) => ({ ...counts, [field.key]: composition[field.key] }),
      {} as RoleCounts
    )
  );

export const PartyBuilderPage: React.FC = () => {
  const { token, logout } = useAuth();

  const [compositions, setCompositions] = useState<CompositionDto[]>([]);
  const [isLoadingComps, setIsLoadingComps] = useState(true);
  const [compsError, setCompsError] = useState<string | null>(null);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [selectedComposition, setSelectedComposition] = useState<CompositionDto | null>(null);
  const [assignmentName, setAssignmentName] = useState<string | null>(null);
  const [slots, setSlots] = useState<PartySlot[]>([]);
  const [openCharacterSelectIndex, setOpenCharacterSelectIndex] = useState<number | null>(null);
  const [isNewAssignmentModalOpen, setIsNewAssignmentModalOpen] = useState(false);
  const [newAssignmentPartyType, setNewAssignmentPartyType] = useState<PartyType | ''>('');
  const [newAssignmentCounts, setNewAssignmentCounts] = useState<RoleCounts>(emptyRoleCounts);
  const [newAssignmentError, setNewAssignmentError] = useState<string | null>(null);
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false);

  const loadCompositions = useCallback(async () => {
    setIsLoadingComps(true);
    setCompsError(null);
    try {
      setCompositions(await fetchPartyCompositions(token, logout));
    } catch (err: unknown) {
      setCompsError(getErrorMessage(err));
    } finally {
      setIsLoadingComps(false);
    }
  }, [logout, token]);

  useEffect(() => {
    void loadCompositions();
  }, [loadCompositions]);

  useEffect(() => {
    setIsLoadingUsers(true);
    fetchAllUsers(token, logout)
      .then(setUsers)
      .catch(() => { /* silently ignore */ })
      .finally(() => setIsLoadingUsers(false));
  }, [logout, token]);

  const allCharacters = useMemo(
    () => users.flatMap((u) => (u.characters ?? []).filter(Boolean)),
    [users]
  );

  const compositionRows = useMemo(
    () =>
      compositions.map((composition) => ({
        composition,
        roleTags: getCompositionRoleTags(composition),
      })),
    [compositions]
  );

  const handleRowClick = (composition: CompositionDto) => {
    if (selectedComposition?.name === composition.name) {
      setSelectedComposition(null);
      setAssignmentName(null);
      setSlots([]);
      setOpenCharacterSelectIndex(null);
      return;
    }
    setSelectedComposition(composition);
    setAssignmentName(composition.name);
    setSlots(buildSlotsFromComposition(composition));
    setOpenCharacterSelectIndex(null);
  };

  const updateSlot = (index: number, field: keyof Pick<PartySlot, 'userId' | 'characterName'>, value: string) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i === index) return { ...slot, [field]: value };
        if (field === 'characterName' && value && slot.characterName === value) {
          return { ...slot, characterName: '' };
        }
        return slot;
      })
    );
  };

  const updateNewAssignmentCount = (key: RoleCountKey, value: string) => {
    const numericValue = Number(value);
    const nextValue = Number.isFinite(numericValue)
      ? Math.min(9, Math.max(0, Math.trunc(numericValue)))
      : 0;

    setNewAssignmentError(null);
    setNewAssignmentCounts((prev) => ({
      ...prev,
      [key]: nextValue,
    }));
  };

  const generateNewAssignment = async () => {
    if (totalNewAssignmentSlots > 9) {
      setNewAssignmentError('La party no puede tener más de 9 personajes.');
      return;
    }

    if (!newAssignmentPartyType) {
      setNewAssignmentError('Selecciona un tipo de party.');
      return;
    }

    setIsGeneratingAssignment(true);
    setNewAssignmentError(null);
    try {
      const isValid = await validatePartyComposition(token, logout, {
        PartyType: newAssignmentPartyType,
        DpsCount: newAssignmentCounts.dpsCount,
        BishopCount: newAssignmentCounts.bishopCount,
        BardCount: newAssignmentCounts.bardCount,
        BufferCount: newAssignmentCounts.bufferCount,
        TankCount: newAssignmentCounts.tankCount,
        RechargerCount: newAssignmentCounts.rechargerCount,
        IsPartyFull: totalNewAssignmentSlots === 9,
      });

      if (!isValid) {
        setNewAssignmentError('Esa composicion de party no es válida.');
        return;
      }

      setSelectedComposition(null);
      setAssignmentName('Nueva asignación');
      setSlots(buildSlotsFromRoleCounts(newAssignmentCounts));
      setOpenCharacterSelectIndex(null);
      setIsNewAssignmentModalOpen(false);
    } catch (err: unknown) {
      setNewAssignmentError(getErrorMessage(err));
    } finally {
      setIsGeneratingAssignment(false);
    }
  };

  const totalNewAssignmentSlots = roleCountFields.reduce(
    (sum, field) => sum + newAssignmentCounts[field.key],
    0
  );

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Constructor de party</h2>
        <p className="text-slate-400">Organiza y prepara composiciones para la Constant Party.</p>
      </header>

      {/* Compositions table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
              {partyBuilderIcon}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-100">Composiciones</h3>
              {!isLoadingComps && !compsError ? (
                <p className="text-xs text-slate-500">
                  {compositions.length} composición{compositions.length !== 1 ? 'es' : ''}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadCompositions()}
            disabled={isLoadingComps}
            title="Recargar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
          >
            <svg
              className={`h-4 w-4 ${isLoadingComps ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              {refreshIconPath}
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoadingComps ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
              <p className="text-sm text-slate-500">Cargando composiciones...</p>
            </div>
          ) : compsError ? (
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
                <p className="text-sm font-medium text-red-400">{compsError}</p>
                <button
                  type="button"
                  onClick={() => void loadCompositions()}
                  className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : compositionRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No hay composiciones registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Composiciones de party</caption>
                <thead>
                  <tr className="border-b border-slate-800">
                    <th scope="col" className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Nombre
                    </th>
                    <th scope="col" className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Party Roles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {compositionRows.map(({ composition, roleTags }) => {
                    const isSelected = selectedComposition?.name === composition.name;
                    return (
                      <tr
                        key={composition.name}
                        onClick={() => handleRowClick(composition)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className={`py-3 pr-4 font-medium ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {composition.name}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-1.5">
                            {roleTags.length > 0 ? (
                              roleTags.map((tag) => (
                                <span
                                  key={tag.key}
                                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tag.className}`}
                                >
                                  {tag.count} {tag.label}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs italic text-slate-600">Sin roles</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Party assignment card — always visible */}
      <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100">
              Asignación
              {assignmentName !== null ? (
                <> — <span className="text-cyan-400">{assignmentName}</span></>
              ) : null}
            </h3>
            <p className="text-xs text-slate-500">
              {assignmentName !== null
                ? `${slots.length} slot${slots.length !== 1 ? 's' : ''} · selecciona usuario y personaje para cada puesto`
                : 'Haz clic en una composición de la tabla o crea una asignación manual.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNewAssignmentError(null);
              setIsNewAssignmentModalOpen(true);
            }}
            className="shrink-0 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
          >
            Nueva asignacion
          </button>
        </div>

        <div className="p-6">
          {assignmentName === null ? (
            <p className="py-8 text-center text-sm text-slate-600">Ninguna composición seleccionada.</p>
          ) : isLoadingUsers ? (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
              <p className="text-sm text-slate-500">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Column headers */}
              <div className="grid grid-cols-[10rem_1fr_1fr] gap-4 px-1">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Rol</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Usuario</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Personaje</p>
              </div>

              {slots.map((slot, index) => {
                const roleCharacters = allCharacters.filter((c) => isCharacterForRole(c, slot.role));

                return (
                  <div key={index} className="grid grid-cols-[10rem_1fr_1fr] items-center gap-4">
                    {/* Role badge */}
                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${slot.roleClassName}`}
                    >
                      {slot.role}
                    </span>

                    {/* User */}
                    <select
                      value={slot.userId}
                      onChange={(e) => updateSlot(index, 'userId', e.target.value)}
                      className={selectClassName}
                    >
                      <option value="">Selecciona un usuario</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.userName}
                        </option>
                      ))}
                    </select>

                    {/* Character */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenCharacterSelectIndex((current) => (current === index ? null : index))}
                        disabled={roleCharacters.length === 0}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950/80 py-2 pl-3 pr-3 text-left text-xs font-medium text-slate-200 shadow-sm transition-colors hover:bg-slate-900 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {slot.characterName ? (
                          (() => {
                            const selectedCharacter = roleCharacters.find((c) => getCharacterName(c) === slot.characterName);
                            const selectedClassName = selectedCharacter ? getCharacterClassName(selectedCharacter) : '';

                            return (
                              <span className="flex min-w-0 items-center gap-2">
                                <ClassPhoto classNameValue={selectedClassName} alt={slot.characterName} />
                                <span className="truncate">
                                  {slot.characterName}
                                  {selectedClassName ? ` (${selectedClassName})` : ''}
                                </span>
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-slate-400">Selecciona un personaje</span>
                        )}
                        <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openCharacterSelectIndex === index ? (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              updateSlot(index, 'characterName', '');
                              setOpenCharacterSelectIndex(null);
                            }}
                            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                          >
                            Selecciona un personaje
                          </button>
                          {roleCharacters.map((c, ci) => {
                            const characterName = getCharacterName(c);
                            const characterClassName = getCharacterClassName(c);

                            return (
                              <button
                                key={`${characterName}-${ci}`}
                                type="button"
                                onClick={() => {
                                  updateSlot(index, 'characterName', characterName);
                                  setOpenCharacterSelectIndex(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300"
                              >
                                <ClassPhoto classNameValue={characterClassName} alt={characterName} />
                                <span className="min-w-0 truncate">
                                  {characterName} ({characterClassName})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isNewAssignmentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Nueva asignación</h3>
                <p className="text-xs text-slate-500">Selecciona cuántos slots habrá de cada rol.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewAssignmentError(null);
                  setIsNewAssignmentModalOpen(false);
                }}
                title="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 p-6">
              {newAssignmentError !== null ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
                  {newAssignmentError}
                </div>
              ) : null}

              <label className="block rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Tipo de party
                </span>
                <select
                  value={newAssignmentPartyType}
                  onChange={(e) => {
                    setNewAssignmentError(null);
                    setNewAssignmentPartyType(e.target.value as PartyType | '');
                  }}
                  className={selectClassName}
                >
                  <option value="">— selecciona tipo —</option>
                  {PARTY_TYPES.map((partyType) => (
                    <option key={partyType} value={partyType}>
                      {partyType}
                    </option>
                  ))}
                </select>
              </label>

              {roleCountFields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${field.className}`}
                  >
                    {field.label}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newAssignmentCounts[field.key]}
                    onChange={(e) => updateNewAssignmentCount(field.key, e.target.value)}
                    className="w-20 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-center text-sm font-semibold text-slate-200 shadow-sm focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-6 py-4">
              <p className="text-xs text-slate-500">
                {totalNewAssignmentSlots} slot{totalNewAssignmentSlots !== 1 ? 's' : ''} seleccionado{totalNewAssignmentSlots !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewAssignmentError(null);
                    setIsNewAssignmentModalOpen(false);
                  }}
                  disabled={isGeneratingAssignment}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void generateNewAssignment()}
                  disabled={totalNewAssignmentSlots === 0 || isGeneratingAssignment}
                  className="rounded-lg bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isGeneratingAssignment ? 'Validando...' : 'Generar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

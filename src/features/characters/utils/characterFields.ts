import type { UserCharacterRow } from '../../users/api/usersApi';

export const MIN_CHARACTER_LEVEL = 1;
export const MAX_CHARACTER_LEVEL = 99;

export const getCharacterName = (character: UserCharacterRow) => character.name ?? character.Name ?? '';

export const getCharacterClassName = (character: UserCharacterRow) =>
  character.className ?? character.ClassName ?? '';

export const getCharacterLevel = (character: UserCharacterRow) => {
  const level = character.level ?? character.Level;
  if (typeof level === 'number' && !Number.isNaN(level)) {
    return clampCharacterLevel(level);
  }
  return MIN_CHARACTER_LEVEL;
};

export const clampCharacterLevel = (value: number) =>
  Math.min(MAX_CHARACTER_LEVEL, Math.max(MIN_CHARACTER_LEVEL, Math.round(value)));

export const getCharacterLogin = (character: UserCharacterRow) =>
  (character.login ?? character.Login ?? '').trim();

export const getCharacterHasPassword = (character: UserCharacterRow) =>
  Boolean(character.hasPassword ?? character.HasPassword);

/** Client-side plaintext only (forms). Never populated from API responses. */
export const getCharacterPassword = (character: UserCharacterRow) =>
  character.password ?? character.Password ?? '';

/** Password without login is invalid; login alone or both together is valid. */
export const validateCharacterCredentials = (login: string, password: string): string | null => {
  const hasLogin = login.trim().length > 0;
  const hasNewPassword = password.length > 0;

  if (hasNewPassword && !hasLogin) {
    return 'No puedes guardar una contraseña sin login.';
  }

  return null;
};

/** Plaintext password for API update payloads; omit when unchanged; null/'' clears on server. */
export const characterPasswordForUpdate = (
  character: UserCharacterRow
): string | null | undefined => {
  if (character.passwordChange !== undefined) {
    return character.passwordChange;
  }
  const draft = getCharacterPassword(character).trim();
  return draft.length > 0 ? draft : undefined;
};

export const formatCharacterLoginDisplay = (login: string) =>
  login.trim() ? login.trim() : 'Sin login';

export const formatCharacterPasswordDisplay = (hasPassword: boolean) =>
  hasPassword ? '••••••••' : 'Sin password';

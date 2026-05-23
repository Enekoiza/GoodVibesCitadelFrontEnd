import { authenticatedFetch } from '../../auth/api/authFetch';
import {
  getCharacterLogin,
  getCharacterLevel,
  getCharacterHasPassword,
} from '../../characters/utils/characterFields';
import type { UserCharacterRow } from '../../users/api/usersApi';

interface CharacterInfoResponseDto {
  name?: string;
  Name?: string;
  className?: string;
  ClassName?: string;
  type?: string;
  Type?: string;
  classType?: string;
  ClassType?: string;
  level?: number;
  Level?: number;
  login?: string;
  Login?: string;
  hasPassword?: boolean;
  HasPassword?: boolean;
}

interface CharacterInfoUpdateDto {
  name: string;
  className: string;
  classType: string;
  level: number;
  login: string;
  password?: string | null;
}

const mapCharacter = (raw: CharacterInfoResponseDto): UserCharacterRow => ({
  name: raw.name ?? raw.Name,
  className: raw.className ?? raw.ClassName,
  type: raw.type ?? raw.Type ?? raw.classType ?? raw.ClassType,
  level: getCharacterLevel(raw),
  login: getCharacterLogin(raw),
  hasPassword: getCharacterHasPassword(raw),
});

const toCharacterUpdatePayload = (character: UserCharacterRow): CharacterInfoUpdateDto => {
  const payload: CharacterInfoUpdateDto = {
    name: character.name ?? character.Name ?? '',
    className: character.className ?? character.ClassName ?? '',
    classType: character.type ?? character.Type ?? character.classType ?? character.ClassType ?? '',
    level: getCharacterLevel(character),
    login: getCharacterLogin(character),
  };

  if (character.passwordChange !== undefined) {
    payload.password = character.passwordChange;
  }

  return payload;
};

const readApiErrorMessage = async (response: Response, fallback: string) => {
  const errorBody = (await response.json().catch(() => null)) as { message?: string; Message?: string } | null;
  return errorBody?.message ?? errorBody?.Message ?? fallback;
};

export async function updateMyCharacterCredentials(
  characterName: string,
  login: string,
  password: string | undefined,
  token: string | null,
  logout: () => void
): Promise<void> {
  const body: { login: string; password?: string } = { login };
  if (password !== undefined) {
    body.password = password;
  }

  const response = await authenticatedFetch(
    `/api/users/me/characters/${encodeURIComponent(characterName)}/credentials`,
    token,
    logout,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, `Error ${response.status}: No se pudieron guardar las credenciales.`)
    );
  }
}

export async function fetchMyCharacters(
  token: string | null,
  logout: () => void
): Promise<UserCharacterRow[]> {
  const response = await authenticatedFetch('/api/users/me/characters', token, logout);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar tus personajes.`);
  }

  const data = (await response.json()) as CharacterInfoResponseDto[];
  return data.map(mapCharacter);
}

export async function updateMyCharacters(
  characters: UserCharacterRow[],
  token: string | null,
  logout: () => void
): Promise<void> {
  const response = await authenticatedFetch('/api/users/me/characters', token, logout, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characters.map(toCharacterUpdatePayload)),
  });

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, `Error ${response.status}: No se pudieron guardar los personajes.`)
    );
  }
}

export async function fetchMyCharacterPassword(
  characterName: string,
  token: string | null,
  logout: () => void
): Promise<string> {
  const response = await authenticatedFetch(
    `/api/users/me/characters/${encodeURIComponent(characterName)}/password`,
    token,
    logout
  );

  if (response.status === 409) {
    throw new Error(
      'Escribe la contraseña de nuevo en editar credenciales y guarda para actualizarla.'
    );
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo obtener la contraseña.`);
  }

  const data = (await response.json()) as { password?: string; Password?: string };
  return data.password ?? data.Password ?? '';
}

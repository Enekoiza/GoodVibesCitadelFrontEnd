import { apiUrl } from '../../../config/api';

export interface UserCharacterRow {
  name: string;
  className: string;
}

export interface AppUser {
  id: string;
  userName: string;
  roles: string[];
  characters: UserCharacterRow[];
}

export async function fetchAllUsers(token: string | null): Promise<AppUser[]> {
  if (!token) throw new Error('No hay sesión activa para cargar los miembros.');

  const response = await fetch(apiUrl('/api/users/getAll'), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar los usuarios.`);
  }

  return response.json() as Promise<AppUser[]>;
}

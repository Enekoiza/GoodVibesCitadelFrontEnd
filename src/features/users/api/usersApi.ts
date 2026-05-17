import { authenticatedFetch } from '../../auth/api/authFetch';

export interface UserCharacterRow {
  name?: string;
  Name?: string;
  className?: string;
  ClassName?: string;
  type?: string;
  Type?: string;
  classType?: string;
  ClassType?: string;
}

export interface AppUser {
  id: string;
  userName: string;
  roles: string[];
  characters: UserCharacterRow[];
}

export async function fetchAllUsers(token: string | null, logout: () => void): Promise<AppUser[]> {
  const response = await authenticatedFetch('/api/users/getAll', token, logout, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar los usuarios.`);
  }

  return response.json() as Promise<AppUser[]>;
}

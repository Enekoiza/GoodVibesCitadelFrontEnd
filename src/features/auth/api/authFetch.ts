import { apiUrl } from '../../../config/api';
import { isJwtExpired, SESSION_EXPIRED_MESSAGE } from '../utils/token';

type Logout = () => void;

export const authenticatedFetch = async (
  path: string,
  token: string | null,
  logout: Logout,
  init: RequestInit = {}
) => {
  if (!token) throw new Error('No hay sesión activa. Vuelve a iniciar sesión.');

  if (isJwtExpired(token)) {
    logout();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  return response;
};

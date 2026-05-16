import { jwtDecode, type JwtPayload } from 'jwt-decode';

export const SESSION_EXPIRED_MESSAGE = 'Tu sesión ha caducado. Vuelve a iniciar sesión.';

export const isJwtExpired = (accessToken: string) => {
  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    if (typeof decoded.exp !== 'number') return false;

    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

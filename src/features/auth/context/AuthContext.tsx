import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiUrl } from '../../../config/api';
import { WAITING_ROLE } from '../../../constants';
import { isJwtExpired } from '../utils/token';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  username: string | null;
  /** Roles from the JWT (DB). Empty means pending / no role assigned yet. */
  roles: string[];
  /** Label for UI: `Waiting` when `roles` is empty, otherwise joined role names. */
  role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const collectRolesFromDecoded = (decoded: Record<string, unknown>): string[] => {
  const fromValue = (value: unknown): string[] => {
    if (value == null) return [];
    if (Array.isArray(value)) {
      return value
        .filter((v): v is string => typeof v === 'string')
        .map((v) => v.trim())
        .filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    return [];
  };

  const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const merged = [
    ...fromValue(decoded[roleClaimKey]),
    ...fromValue(decoded.role),
    ...fromValue(decoded.Role),
  ];
  return [...new Set(merged)];
};

// Helper to extract roles and username from .NET JWT (no default admin role)
const extractClaimsFromToken = (accessToken: string, fallbackUsername: string) => {
  try {
    const decoded = jwtDecode(accessToken) as Record<string, unknown>;
    const rolesFromToken = collectRolesFromDecoded(decoded);
    const name =
      (decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string | undefined) ||
      (decoded.unique_name as string | undefined) ||
      (decoded.name as string | undefined) ||
      (decoded.Name as string | undefined) ||
      fallbackUsername;

    const displayRole = rolesFromToken.length === 0 ? WAITING_ROLE : rolesFromToken.join(', ');

    return { roles: rolesFromToken, role: displayRole, name };
  } catch (e) {
    console.error('Failed to decode token', e);
    return { roles: [] as string[], role: WAITING_ROLE, name: fallbackUsername };
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [role, setRoleState] = useState<string | null>(null);
  const [roles, setRolesState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUsernameState(null);
    setRolesState([]);
    setRoleState(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    // Check if user is already logged in on mount
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      if (isJwtExpired(storedToken)) {
        logout();
        setIsLoading(false);
        return;
      }

      // Pass empty string as fallback since user doesn't re-type name on mount
      const { roles: extractedRoles, role: extractedRole, name: extractedUsername } = extractClaimsFromToken(
        storedToken,
        'Miembro'
      );
      setToken(storedToken);
      setUsernameState(extractedUsername);
      setRolesState(extractedRoles);
      setRoleState(extractedRole);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login fallido. Verifica tus credenciales.');
      }

      const data = await response.json();
      
      // .NET Identity typically returns an accessToken
      const { accessToken } = data;
      
      if (accessToken) {
        if (isJwtExpired(accessToken)) {
          logout();
          throw new Error('El token recibido ha caducado. Vuelve a iniciar sesión.');
        }

        const { roles: extractedRoles, role: extractedRole, name: extractedUsername } = extractClaimsFromToken(
          accessToken,
          username
        );

        localStorage.setItem('accessToken', accessToken);

        setToken(accessToken);
        setUsernameState(extractedUsername);
        setRolesState(extractedRoles);
        setRoleState(extractedRole);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout, token, username, roles, role }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { authenticatedFetch } from '../../auth/api/authFetch';

export interface CompositionDto {
  name: string;
  dpsCount: number;
  bishopCount: number;
  bardCount: number;
  bufferCount: number;
  tankCount: number;
  rechargerCount: number;
  isPartyFull: boolean;
}

export const PARTY_TYPES = ['Farm', 'Pvp', 'Siege', 'Raid', 'Support'] as const;

export type PartyType = (typeof PARTY_TYPES)[number];

export interface ValidatePartyRequest {
  PartyType: PartyType;
  DpsCount: number;
  BishopCount: number;
  BardCount: number;
  BufferCount: number;
  TankCount: number;
  RechargerCount: number;
  IsPartyFull: boolean;
}

const parseCompositionsResponse = async (response: Response): Promise<CompositionDto[]> => {
  const text = await response.text();
  if (!text.trim()) return [];

  const data: unknown = JSON.parse(text);
  if (data == null) return [];
  if (Array.isArray(data)) return data as CompositionDto[];
  return [];
};

const parseBooleanResponse = async (response: Response): Promise<boolean> => {
  const text = await response.text();
  if (!text.trim()) return false;

  const normalizedText = text.trim().toLowerCase();
  if (normalizedText === 'true') return true;
  if (normalizedText === 'false') return false;

  const data: unknown = JSON.parse(text);
  return data === true;
};

export const fetchPartyCompositions = async (
  token: string | null,
  logout: () => void
): Promise<CompositionDto[]> => {
  const response = await authenticatedFetch('/api/builder/getComps', token, logout, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron cargar las composiciones.`);
  return parseCompositionsResponse(response);
};

export const validatePartyComposition = async (
  token: string | null,
  logout: () => void,
  payload: ValidatePartyRequest
): Promise<boolean> => {
  const response = await authenticatedFetch('/api/builder/validate', token, logout, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Error ${response.status}: No se pudo validar la composición.`);
  return parseBooleanResponse(response);
};

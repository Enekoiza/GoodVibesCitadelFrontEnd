import { authenticatedFetch } from '../../auth/api/authFetch';

export type WarehouseEntryType = 'Item' | 'Material' | 'Receta';

export interface CpWarehouseEntry {
  id: number;
  entryType: WarehouseEntryType;
  entityId: number;
  nombre: string;
  imagenUrl: string | null;
  quantity: number;
}

export interface WarehouseCatalogResult {
  id: number;
  nombre: string;
  imagenUrl: string | null;
  entryType: WarehouseEntryType;
}

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return null;
  return String(value);
};

const parseEntryType = (value: unknown): WarehouseEntryType => {
  const raw = asString(value);
  if (raw === 'Item' || raw === 'Material' || raw === 'Receta') return raw;
  throw new Error('Tipo de entrada de almacén no válido.');
};

export const normalizeWarehouseEntry = (raw: Record<string, unknown>): CpWarehouseEntry => {
  const id = asNumber(raw.id ?? raw.Id);
  if (id === null || id <= 0) {
    throw new Error('La respuesta no incluye un identificador de entrada válido.');
  }

  const entityId = asNumber(raw.entityId ?? raw.EntityId);
  if (entityId === null || entityId <= 0) {
    throw new Error('La respuesta no incluye un identificador de entidad válido.');
  }

  const quantity = asNumber(raw.quantity ?? raw.Quantity);
  if (quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('La respuesta no incluye una cantidad válida.');
  }

  return {
    id,
    entryType: parseEntryType(raw.entryType ?? raw.EntryType),
    entityId,
    nombre: asString(raw.nombre ?? raw.Nombre) ?? '',
    imagenUrl: asString(raw.imagenUrl ?? raw.ImagenUrl),
    quantity,
  };
};

const normalizeCatalogResult = (raw: Record<string, unknown>): WarehouseCatalogResult => {
  const id = asNumber(raw.id ?? raw.Id);
  if (id === null || id <= 0) {
    throw new Error('Resultado de catálogo sin identificador válido.');
  }

  return {
    id,
    nombre: asString(raw.nombre ?? raw.Nombre) ?? '',
    imagenUrl: asString(raw.imagenUrl ?? raw.ImagenUrl),
    entryType: parseEntryType(raw.entryType ?? raw.EntryType),
  };
};

export async function fetchCpWarehouse(
  token: string | null,
  logout: () => void
): Promise<CpWarehouseEntry[]> {
  const response = await authenticatedFetch('/api/warehouse', token, logout);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo cargar el almacén CP.`);
  }

  const raw = (await response.json()) as Record<string, unknown>[];
  return raw.map(normalizeWarehouseEntry);
}

export async function searchWarehouseCatalog(
  entryType: WarehouseEntryType,
  query: string,
  token: string | null,
  logout: () => void,
  limit = 20
): Promise<WarehouseCatalogResult[]> {
  const params = new URLSearchParams({ type: entryType, q: query, limit: String(limit) });
  const response = await authenticatedFetch(`/api/warehouse/catalog-search?${params}`, token, logout);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo buscar en el catálogo.`);
  }

  const raw = (await response.json()) as Record<string, unknown>[];
  return raw.map(normalizeCatalogResult);
}

export async function searchWarehouseCatalogAll(
  query: string,
  token: string | null,
  logout: () => void,
  limit = 20
): Promise<WarehouseCatalogResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await authenticatedFetch(`/api/warehouse/catalog-search?${params}`, token, logout);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo buscar en el catálogo.`);
  }

  const raw = (await response.json()) as Record<string, unknown>[];
  return raw.map(normalizeCatalogResult);
}

export interface SyncCpWarehouseEntryPayload {
  id?: number;
  entryType: WarehouseEntryType;
  entityId: number;
  quantity: number;
}

export async function syncCpWarehouse(
  entries: SyncCpWarehouseEntryPayload[],
  token: string | null,
  logout: () => void
): Promise<CpWarehouseEntry[]> {
  const response = await authenticatedFetch('/api/warehouse/sync', token, logout, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entries: entries.map((entry) => ({
        id: entry.id ?? null,
        entryType: entry.entryType,
        entityId: entry.entityId,
        quantity: entry.quantity,
      })),
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Error ${response.status}: No se pudieron guardar los cambios.`);
  }

  const raw = (await response.json()) as Record<string, unknown>[];
  return raw.map(normalizeWarehouseEntry);
}

export async function addCpWarehouseEntry(
  entryType: WarehouseEntryType,
  entityId: number,
  quantity: number,
  token: string | null,
  logout: () => void
): Promise<CpWarehouseEntry> {
  const response = await authenticatedFetch('/api/warehouse', token, logout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryType, entityId, quantity }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Error ${response.status}: No se pudo añadir la entrada.`);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return normalizeWarehouseEntry(raw);
}

export async function updateCpWarehouseEntry(
  id: number,
  quantity: number,
  token: string | null,
  logout: () => void
): Promise<CpWarehouseEntry> {
  const response = await authenticatedFetch(`/api/warehouse/${id}`, token, logout, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Error ${response.status}: No se pudo actualizar la entrada.`);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return normalizeWarehouseEntry(raw);
}

export async function deleteCpWarehouseEntry(
  id: number,
  token: string | null,
  logout: () => void
): Promise<void> {
  const response = await authenticatedFetch(`/api/warehouse/${id}`, token, logout, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Error ${response.status}: No se pudo eliminar la entrada.`);
  }
}

export const entryTypeLabel: Record<WarehouseEntryType, string> = {
  Item: 'Objeto',
  Material: 'Material',
  Receta: 'Receta',
};

export const entryTypeBadgeClass: Record<WarehouseEntryType, string> = {
  Item: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300',
  Material: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  Receta: 'border-violet-500/25 bg-violet-500/10 text-violet-300',
};

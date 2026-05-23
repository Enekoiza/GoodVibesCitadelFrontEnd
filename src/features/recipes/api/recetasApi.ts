import { authenticatedFetch } from '../../auth/api/authFetch';

export interface Receta {
  id: number;
  nombre: string;
  imagenUrl: string | null;
  nivel: number | null;
  url: string | null;
}

export interface RecetaCraftedItem {
  id: number;
  nombre: string;
  imagenUrl: string | null;
  grado: string | null;
}

export interface RecetaMaterial {
  id: number;
  nombre: string | null;
  imagenUrl: string | null;
  cantidad: number | null;
  nivel: number;
  hijos: RecetaMaterial[];
}

export interface RecetaDetail {
  id: number;
  nombre: string;
  imagenUrl: string | null;
  nivel: number | null;
  url: string | null;
  materiales: RecetaMaterial[];
  items: RecetaCraftedItem[];
}

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  return asNumber(value);
};

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return null;
  return String(value);
};

export const normalizeReceta = (raw: Record<string, unknown>): Receta => {
  const id = asNumber(raw.id ?? raw.Id);
  if (id === null || id <= 0) {
    throw new Error('La respuesta de búsqueda no incluye un identificador de receta válido.');
  }

  return {
    id,
    nombre: asString(raw.nombre ?? raw.Nombre) ?? '',
    imagenUrl: asString(raw.imagenUrl ?? raw.ImagenUrl),
    nivel: asOptionalNumber(raw.nivel ?? raw.Nivel),
    url: asString(raw.url ?? raw.Url),
  };
};

const normalizeRecetaCraftedItem = (raw: Record<string, unknown>): RecetaCraftedItem => ({
  id: asNumber(raw.id ?? raw.Id) ?? 0,
  nombre: asString(raw.nombre ?? raw.Nombre) ?? '',
  imagenUrl: asString(raw.imagenUrl ?? raw.ImagenUrl),
  grado: asString(raw.grado ?? raw.Grado),
});

const normalizeRecetaMaterial = (raw: Record<string, unknown>): RecetaMaterial => {
  const hijosRaw = raw.hijos ?? raw.Hijos;
  const hijos = Array.isArray(hijosRaw)
    ? hijosRaw.map((item) => normalizeRecetaMaterial(item as Record<string, unknown>))
    : [];

  return {
    id: asNumber(raw.id ?? raw.Id) ?? 0,
    nombre: asString(raw.nombre ?? raw.Nombre),
    imagenUrl: asString(raw.imagenUrl ?? raw.ImagenUrl),
    cantidad: asOptionalNumber(raw.cantidad ?? raw.Cantidad),
    nivel: asNumber(raw.nivel ?? raw.Nivel) ?? 0,
    hijos,
  };
};

export async function searchRecetas(
  query: string,
  token: string | null,
  logout: () => void,
  limit = 50
): Promise<Receta[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await authenticatedFetch(`/api/recetas/search?${params}`, token, logout);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron buscar las recetas.`);
  }

  const raw = (await response.json()) as Record<string, unknown>[];
  return raw.map(normalizeReceta);
}

export interface RecetaMaterialesResponse {
  materiales: RecetaMaterial[];
  items: RecetaCraftedItem[];
}

export async function fetchRecetaMateriales(
  recetaId: number,
  token: string | null,
  logout: () => void
): Promise<RecetaMaterialesResponse> {
  if (!Number.isFinite(recetaId) || recetaId <= 0) {
    throw new Error('Identificador de receta inválido.');
  }

  const response = await authenticatedFetch(`/api/recetas/${recetaId}/materiales`, token, logout);

  if (response.status === 404) {
    throw new Error('No se encontró la receta.');
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar los materiales.`);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const materialesRaw = raw.materiales ?? raw.Materiales;
  const itemsRaw = raw.items ?? raw.Items;

  return {
    materiales: Array.isArray(materialesRaw)
      ? materialesRaw.map((item) => normalizeRecetaMaterial(item as Record<string, unknown>))
      : [],
    items: Array.isArray(itemsRaw)
      ? itemsRaw.map((item) => normalizeRecetaCraftedItem(item as Record<string, unknown>))
      : [],
  };
}

export async function fetchRecetaDetail(
  receta: Receta,
  token: string | null,
  logout: () => void
): Promise<RecetaDetail> {
  const { materiales, items } = await fetchRecetaMateriales(receta.id, token, logout);

  return {
    id: receta.id,
    nombre: receta.nombre,
    imagenUrl: receta.imagenUrl,
    nivel: receta.nivel,
    url: receta.url,
    materiales,
    items,
  };
}

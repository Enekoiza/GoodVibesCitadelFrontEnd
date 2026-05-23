import { authenticatedFetch } from '../../auth/api/authFetch';

export interface ItemLookupResult {
  name: string;
  imageUrl: string | null;
}

type RawItemLookup = {
  name?: string;
  Name?: string;
  imageUrl?: string | null;
  ImageUrl?: string | null;
};

const normalizeItemLookup = (raw: RawItemLookup): ItemLookupResult => ({
  name: String(raw.name ?? raw.Name ?? ''),
  imageUrl: raw.imageUrl ?? raw.ImageUrl ?? null,
});

export const lookupItemsByNames = async (
  token: string | null,
  logout: () => void,
  names: string[]
): Promise<ItemLookupResult[]> => {
  const uniqueNames = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  if (uniqueNames.length === 0) return [];

  const response = await authenticatedFetch('/api/items/lookup', token, logout, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ Names: uniqueNames }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar las imágenes de los items.`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((item) => normalizeItemLookup(item as RawItemLookup));
};

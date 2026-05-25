import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { hasWarehouseEditRole } from '../../../constants';
import { useAuth } from '../../auth/context/AuthContext';
import {
  entryTypeLabel,
  fetchCpWarehouse,
  searchWarehouseCatalogAll,
  syncCpWarehouse,
  type CpWarehouseEntry,
  type WarehouseCatalogResult,
  type WarehouseEntryType,
} from '../api/warehouseApi';
import {
  CpWarehouseTable,
  parseDraftQuantity,
  toDraftRows,
  type WarehouseDraftRow,
} from '../components/CpWarehouseTable';

const warehouseIcon = (
  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

let draftRowCounter = 0;

type WarehouseTypeFilter = 'all' | WarehouseEntryType;

const TYPE_FILTER_OPTIONS: { value: WarehouseTypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'Material', label: entryTypeLabel.Material },
  { value: 'Item', label: entryTypeLabel.Item },
  { value: 'Receta', label: entryTypeLabel.Receta },
];

const nextDraftKey = () => {
  draftRowCounter += 1;
  return `new-${draftRowCounter}`;
};

export const CpWarehousePage: React.FC = () => {
  const { token, logout, roles } = useAuth();
  const canEdit = hasWarehouseEditRole(roles);

  const [entries, setEntries] = useState<CpWarehouseEntry[]>([]);
  const [draftRows, setDraftRows] = useState<WarehouseDraftRow[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WarehouseCatalogResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<WarehouseCatalogResult | null>(null);
  const [newRowQuantity, setNewRowQuantity] = useState('1');
  const [typeFilter, setTypeFilter] = useState<WarehouseTypeFilter>('all');

  const loadWarehouse = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCpWarehouse(token, logout);
      setEntries(data);
      setDraftRows(toDraftRows(data));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar el almacén.');
    } finally {
      setIsLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    void loadWarehouse();
  }, [loadWarehouse]);

  useEffect(() => {
    if (!isEditMode) return;

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);

    const timeoutId = window.setTimeout(() => {
      void searchWarehouseCatalogAll(trimmed, token, logout)
        .then((results) => {
          if (!isCurrent) return;
          setSearchResults(results);
          setSelectedCatalog((current) => {
            if (current) {
              const stillValid = results.some(
                (result) => result.entryType === current.entryType && result.id === current.id
              );
              if (stillValid) return current;
            }

            const exactMatch = results.find(
              (result) => result.nombre.toLowerCase() === trimmed.toLowerCase()
            );
            return exactMatch ?? null;
          });
        })
        .catch((err: unknown) => {
          if (!isCurrent) return;
          setError(err instanceof Error ? err.message : 'No se pudo buscar en el catálogo.');
        })
        .finally(() => {
          if (!isCurrent) return;
          setIsSearching(false);
        });
    }, 300);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [isEditMode, logout, searchQuery, token]);

  const displayRows = useMemo(() => {
    const rows = isEditMode ? draftRows : toDraftRows(entries);
    const sorted = [...rows].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (typeFilter === 'all') return sorted;
    return sorted.filter((row) => row.entryType === typeFilter);
  }, [draftRows, entries, isEditMode, typeFilter]);

  const totalEntryCount = isEditMode ? draftRows.length : entries.length;

  const resetSearchRow = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCatalog(null);
    setNewRowQuantity('1');
  };

  const enterEditMode = () => {
    setDraftRows(toDraftRows(entries));
    resetSearchRow();
    setIsEditMode(true);
    setError(null);
  };

  const handleQuantityChange = (key: string, quantity: string) => {
    setDraftRows((prev) => prev.map((row) => (row.key === key ? { ...row, quantity } : row)));
  };

  const handleSelectCatalog = (result: WarehouseCatalogResult) => {
    setSelectedCatalog(result);
    setSearchQuery(result.nombre);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setSelectedCatalog((current) => {
      if (!current) return null;
      return current.nombre.toLowerCase() === value.trim().toLowerCase() ? current : null;
    });
  };

  const resolvedCatalog = useMemo(() => {
    if (selectedCatalog) return selectedCatalog;

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return null;

    return (
      searchResults.find((result) => result.nombre.toLowerCase() === trimmed.toLowerCase()) ?? null
    );
  }, [searchQuery, searchResults, selectedCatalog]);

  const canAddRow = useMemo(() => {
    if (!resolvedCatalog) return false;
    return parseDraftQuantity(newRowQuantity) !== null;
  }, [newRowQuantity, resolvedCatalog]);

  const handleAddRow = () => {
    if (!resolvedCatalog) return;

    const quantity = parseDraftQuantity(newRowQuantity);
    if (quantity === null) {
      setError('Introduce una cantidad entera mayor que cero.');
      return;
    }

    setDraftRows((prev) => {
      const existing = prev.find(
        (row) =>
          row.entryType === resolvedCatalog.entryType && row.entityId === resolvedCatalog.id
      );

      if (existing) {
        const currentQuantity = parseDraftQuantity(existing.quantity) ?? 0;
        return prev.map((row) =>
          row.key === existing.key ? { ...row, quantity: String(currentQuantity + quantity) } : row
        );
      }

      return [
        ...prev,
        {
          key: nextDraftKey(),
          entryType: resolvedCatalog.entryType,
          entityId: resolvedCatalog.id,
          nombre: resolvedCatalog.nombre,
          imagenUrl: resolvedCatalog.imagenUrl,
          quantity: String(quantity),
        },
      ];
    });

    resetSearchRow();
    setError(null);
  };

  const handleApplyChanges = async () => {
    if (draftRows.length === 0) {
      setError('Añade al menos una entrada antes de aplicar los cambios.');
      return;
    }

    for (const row of draftRows) {
      if (parseDraftQuantity(row.quantity) === null) {
        setError(`La cantidad de «${row.nombre}» debe ser un entero mayor que cero.`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const synced = await syncCpWarehouse(
        draftRows.map((row) => ({
          id: row.id,
          entryType: row.entryType,
          entityId: row.entityId,
          quantity: parseDraftQuantity(row.quantity)!,
        })),
        token,
        logout
      );

      setEntries(synced);
      setDraftRows(toDraftRows(synced));
      setIsEditMode(false);
      resetSearchRow();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditOrApply = () => {
    if (isEditMode) {
      void handleApplyChanges();
      return;
    }

    enterEditMode();
  };

  const showEmptyReadOnly = !isLoading && !isEditMode && totalEntryCount === 0;
  const showFilteredEmpty = !isLoading && totalEntryCount > 0 && displayRows.length === 0 && !isEditMode;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">CP Warehouse</h2>
        <p className="text-slate-400">Inventario de la Constant Party</p>
      </header>

      <div className="rounded-2xl border border-citadel-accent/45 bg-slate-900/50 shadow-xl">
        <div className="grid grid-cols-1 items-center gap-3 border-b border-citadel-accent/30 px-6 py-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 items-center gap-3 md:justify-self-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
              {warehouseIcon}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-100">Almacén CP</h3>
              {!isLoading ? (
                <p className="text-xs text-slate-500">
                  {displayRows.length} entrada{displayRows.length !== 1 ? 's' : ''}
                  {typeFilter !== 'all' ? ` · ${entryTypeLabel[typeFilter]}` : ''}
                  {isEditMode ? ' · modo edición' : ''}
                </p>
              ) : null}
            </div>
          </div>

          <div className="md:justify-self-center">
            <label htmlFor="warehouse-type-filter" className="sr-only">
              Filtrar por tipo
            </label>
            <select
              id="warehouse-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as WarehouseTypeFilter)}
              className="w-full min-w-[10rem] rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 md:w-auto"
            >
              {TYPE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 md:justify-self-end">
            {canEdit ? (
              <button
                type="button"
                onClick={handleEditOrApply}
                disabled={isLoading || isSaving}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
              >
                {isEditMode ? (isSaving ? 'Guardando...' : 'Aplicar cambios') : 'Editar warehouse'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void loadWarehouse()}
              disabled={isLoading || isSaving || isEditMode}
              title="Recargar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
            >
              <svg
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-visible p-6">
          {error && !isLoading ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
              <p className="text-sm text-slate-500">Cargando almacén...</p>
            </div>
          ) : showEmptyReadOnly ? (
            <p className="py-10 text-center text-sm text-slate-500">
              El almacén CP está vacío.
              {canEdit ? ' Pulsa «Editar warehouse» para añadir la primera entrada.' : null}
            </p>
          ) : showFilteredEmpty ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No hay entradas de tipo {entryTypeLabel[typeFilter]} en el almacén.
            </p>
          ) : (
            <CpWarehouseTable
              rows={displayRows}
              isEditMode={isEditMode}
              onQuantityChange={handleQuantityChange}
              searchQuery={searchQuery}
              onSearchQueryChange={handleSearchQueryChange}
              searchResults={searchResults}
              isSearching={isSearching}
              onSelectCatalog={handleSelectCatalog}
              newRowQuantity={newRowQuantity}
              onNewRowQuantityChange={setNewRowQuantity}
              onAddRow={handleAddRow}
              canAddRow={canAddRow}
            />
          )}
        </div>
      </div>
    </div>
  );
};

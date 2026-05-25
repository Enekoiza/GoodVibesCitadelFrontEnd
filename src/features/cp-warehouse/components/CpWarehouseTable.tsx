import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { WarehouseCatalogResult, WarehouseEntryType } from '../api/warehouseApi';import { entryTypeBadgeClass, entryTypeLabel } from '../api/warehouseApi';

export interface WarehouseDraftRow {
  key: string;
  id?: number;
  entryType: WarehouseEntryType;
  entityId: number;
  nombre: string;
  imagenUrl: string | null;
  quantity: string;
}

const WarehouseItemImage = ({ imageUrl, name }: { imageUrl: string | null; name: string }) =>
  imageUrl ? (
    <img
      src={imageUrl}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      className="h-8 w-8 shrink-0 rounded-md border border-slate-800 bg-slate-900 object-cover"
    />
  ) : (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-[10px] text-slate-600"
      aria-hidden
      title={`Sin imagen para ${name}`}
    >
      ?
    </div>
  );

interface CpWarehouseTableProps {
  rows: WarehouseDraftRow[];
  isEditMode: boolean;
  onQuantityChange: (key: string, quantity: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: WarehouseCatalogResult[];
  isSearching: boolean;
  onSelectCatalog: (result: WarehouseCatalogResult) => void;
  newRowQuantity: string;
  onNewRowQuantityChange: (value: string) => void;
  onAddRow: () => void;
  canAddRow: boolean;
}

export const CpWarehouseTable: React.FC<CpWarehouseTableProps> = ({
  rows,
  isEditMode,
  onQuantityChange,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearching,
  onSelectCatalog,
  newRowQuantity,
  onNewRowQuantityChange,
  onAddRow,
  canAddRow,
}) => {
  const listboxId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const updateDropdownPosition = useCallback(() => {
    const input = searchInputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const maxHeight = 192;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < maxHeight + 16 && rect.top > spaceBelow;

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      maxHeight,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setShowResults(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchInputRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }
      setShowResults(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const showDropdown = isEditMode && showResults && searchQuery.trim().length >= 2;

  useEffect(() => {
    if (!showDropdown) return;

    updateDropdownPosition();

    const handleLayoutChange = () => updateDropdownPosition();
    window.addEventListener('resize', handleLayoutChange);
    window.addEventListener('scroll', handleLayoutChange, true);

    return () => {
      window.removeEventListener('resize', handleLayoutChange);
      window.removeEventListener('scroll', handleLayoutChange, true);
    };
  }, [showDropdown, updateDropdownPosition, searchResults.length, isSearching]);

  const dropdownContent = showDropdown ? (
    <ul
      ref={dropdownRef}
      id={listboxId}
      role="listbox"
      style={dropdownStyle}
      className="overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-2xl ring-1 ring-slate-800/80"
    >
      {isSearching ? (
        <li className="px-3 py-2 text-xs text-slate-500">Buscando...</li>
      ) : searchResults.length === 0 ? (
        <li className="px-3 py-2 text-xs text-slate-500">Sin coincidencias en el catálogo.</li>
      ) : (
        searchResults.map((result) => (
          <li key={`${result.entryType}-${result.id}`} role="option">
            <button
              type="button"
              onClick={() => {
                onSelectCatalog(result);
                setShowResults(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
            >
              <WarehouseItemImage imageUrl={result.imagenUrl} name={result.nombre} />
              <span className="min-w-0 flex-1 truncate">{result.nombre}</span>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${entryTypeBadgeClass[result.entryType]}`}
              >
                {entryTypeLabel[result.entryType]}
              </span>
            </button>
          </li>
        ))
      )}
    </ul>
  ) : null;

  return (
    <>
      <div className="overflow-x-auto overflow-y-visible">
      <table className="w-full text-sm">
        <caption className="sr-only">Inventario CP Warehouse</caption>
        <thead>
          <tr className="border-b border-citadel-accent/30">
            <th scope="col" className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Item
            </th>
            <th scope="col" className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Tipo
            </th>
            <th scope="col" className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Cantidad
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-citadel-accent/25">
          {rows.map((row) => (
            <tr key={row.key} className="transition-colors hover:bg-slate-800/40">
              <td className="py-3 pr-4">
                <div className="flex min-w-0 items-center gap-3">
                  <WarehouseItemImage imageUrl={row.imagenUrl} name={row.nombre} />
                  <span className="min-w-0 truncate font-medium text-slate-200">{row.nombre}</span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${entryTypeBadgeClass[row.entryType]}`}
                >
                  {entryTypeLabel[row.entryType]}
                </span>
              </td>
              <td className="py-3 pr-4 text-right">
                {isEditMode ? (
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(e) => onQuantityChange(row.key, e.target.value)}
                    className="ml-auto block w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  />
                ) : (
                  <span className="inline-flex min-w-[2rem] justify-end rounded-md bg-slate-800 px-2 py-1 text-xs font-medium tabular-nums text-cyan-300">
                    {row.quantity}
                  </span>
                )}
              </td>
            </tr>
          ))}

          {isEditMode ? (
            <tr className="bg-slate-950/40">
              <td className="overflow-visible py-3 pr-4">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      onSearchQueryChange(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Buscar objeto, material o receta..."
                    aria-controls={listboxId}
                    aria-expanded={showDropdown}
                    aria-autocomplete="list"
                    className="w-full min-w-[12rem] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  />

                </div>
              </td>
              <td className="py-3 pr-4" aria-hidden />
              <td className="py-3 pr-4">
                <div className="flex items-center justify-end gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={newRowQuantity}
                    onChange={(e) => onNewRowQuantityChange(e.target.value)}
                    aria-label="Cantidad del nuevo item"
                    className="input-no-spin w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-sm text-slate-100 [appearance:textfield] focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={onAddRow}
                    disabled={!canAddRow}
                    className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Añadir
                  </button>
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>

      {dropdownContent ? createPortal(dropdownContent, document.body) : null}
    </>
  );
};

export const toDraftRows = (
  entries: Array<{
    id: number;
    entryType: WarehouseEntryType;
    entityId: number;
    nombre: string;
    imagenUrl: string | null;
    quantity: number;
  }>
): WarehouseDraftRow[] =>
  entries.map((entry) => ({
    key: `existing-${entry.id}`,
    id: entry.id,
    entryType: entry.entryType,
    entityId: entry.entityId,
    nombre: entry.nombre,
    imagenUrl: entry.imagenUrl,
    quantity: String(entry.quantity),
  }));

export const parseDraftQuantity = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

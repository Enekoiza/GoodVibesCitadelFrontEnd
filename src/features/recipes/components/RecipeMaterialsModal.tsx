import React, { useState } from 'react';
import type { RecetaDetail, RecetaMaterial } from '../api/recetasApi';

const closeIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const formatCantidad = (cantidad: number | null) => {
  if (cantidad == null) return null;
  return Number.isInteger(cantidad) ? String(cantidad) : cantidad.toString();
};

const MaterialImage = ({ imagenUrl }: { imagenUrl: string | null }) =>
  imagenUrl ? (
    <img
      src={imagenUrl}
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
    >
      ?
    </div>
  );

const MaterialRow = ({ material, depth }: { material: RecetaMaterial; depth: number }) => {
  const [expanded, setExpanded] = useState(false);
  const cantidad = formatCantidad(material.cantidad);
  const hasHijos = material.hijos.length > 0;

  const rowClassName =
    'flex w-full items-center gap-3 rounded-lg border border-citadel-accent/35 bg-slate-950/40 px-3 py-2.5';

  const content = (
    <>
      {hasHijos ? (
        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ) : (
        <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
      )}
      <MaterialImage imagenUrl={material.imagenUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-200">{material.nombre ?? 'Material sin nombre'}</p>
        {hasHijos ? (
          <p className="text-xs text-slate-500">
            {expanded ? 'Ocultar submateriales' : 'Ver submateriales'}
          </p>
        ) : null}
      </div>
      {cantidad != null ? (
        <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium tabular-nums text-cyan-300">
          ×{cantidad}
        </span>
      ) : null}
    </>
  );

  return (
    <>
      <li style={{ marginInlineStart: `${depth * 1.25}rem` }}>
        {hasHijos ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className={`${rowClassName} text-left transition-colors hover:border-slate-700 hover:bg-slate-900/80`}
          >
            {content}
          </button>
        ) : (
          <div className={rowClassName}>{content}</div>
        )}
      </li>
      {hasHijos && expanded
        ? material.hijos.map((hijo) => <MaterialRow key={hijo.id} material={hijo} depth={depth + 1} />)
        : null}
    </>
  );
};

const CraftedItemsGallery = ({ items }: { items: RecetaDetail['items'] }) => {
  if (items.length === 0) return null;

  return (
    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Items crafteados</p>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {items.map((item) => (
          <figure
            key={item.id}
            title={item.nombre}
            className="flex w-16 flex-col items-center gap-1 rounded-lg border border-citadel-accent/35 bg-slate-950/70 p-1.5"
          >
            {item.imagenUrl ? (
              <img
                src={item.imagenUrl}
                alt={item.nombre}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 rounded-md border border-slate-800 bg-slate-900 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-[10px] text-slate-600">
                ?
              </div>
            )}
            <figcaption className="line-clamp-2 w-full text-center text-[10px] leading-tight text-slate-400">
              {item.nombre}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};

interface RecipeMaterialsModalProps {
  receta: RecetaDetail;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export const RecipeMaterialsModal: React.FC<RecipeMaterialsModalProps> = ({
  receta,
  isLoading,
  error,
  onClose,
  onRetry,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
    onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div
      className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col rounded-2xl border border-citadel-accent/45 bg-slate-900 shadow-2xl sm:max-h-[min(90dvh,720px)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-materials-title"
    >
      <div className="flex flex-col gap-4 border-b border-citadel-accent/30 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {receta.imagenUrl ? (
            <img
              src={receta.imagenUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-lg border border-slate-800 bg-slate-950 object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <h3 id="recipe-materials-title" className="text-base font-semibold text-slate-100">
              {receta.nombre}
            </h3>
            {receta.nivel != null ? (
              <p className="mt-1 text-sm text-slate-500">Nivel {receta.nivel}</p>
            ) : null}
          </div>
        </div>

        <CraftedItemsGallery items={receta.items} />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 sm:static"
          aria-label="Cerrar modal"
        >
          {closeIcon}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">Materiales necesarios</p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
            <p className="text-sm text-slate-500">Cargando materiales...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-sm font-medium text-red-400">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              Reintentar
            </button>
          </div>
        ) : receta.materiales.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Esta receta no tiene materiales registrados.</p>
        ) : (
          <ul className="space-y-2">
            {receta.materiales.map((material) => (
              <MaterialRow key={material.id} material={material} depth={0} />
            ))}
          </ul>
        )}
      </div>

      {receta.url ? (
        <div className="border-t border-citadel-accent/30 px-6 py-4">
          <a
            href={receta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Ver receta en la wiki →
          </a>
        </div>
      ) : null}
    </div>
  </div>
);

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { RecipeMaterialsModal } from '../components/RecipeMaterialsModal';
import {
  fetchRecetaDetail,
  searchRecetas,
  type Receta,
  type RecetaDetail,
} from '../api/recetasApi';

const SEARCH_DEBOUNCE_MS = 2000;

const recipesIcon = (
  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const searchIcon = (
  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const emptyRecetaDetail = (receta: Receta): RecetaDetail => ({
  id: receta.id,
  nombre: receta.nombre,
  imagenUrl: receta.imagenUrl,
  nivel: receta.nivel,
  url: receta.url,
  materiales: [],
  items: [],
});

export const RecipesPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<RecetaDetail | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const isWaitingForDebounce = trimmedQuery.length > 0 && trimmedQuery !== debouncedQuery;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [trimmedQuery]);

  const runSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm) {
        setRecetas([]);
        setHasSearched(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        setRecetas(await searchRecetas(searchTerm, token, logout));
        setHasSearched(true);
      } catch (err: unknown) {
        setRecetas([]);
        setHasSearched(true);
        setError(err instanceof Error ? err.message : 'Error desconocido al buscar recetas.');
      } finally {
        setIsLoading(false);
      }
    },
    [logout, token]
  );

  useEffect(() => {
    void runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const loadRecetaDetail = useCallback(
    async (receta: Receta) => {
      setSelectedReceta(emptyRecetaDetail(receta));
      setIsModalLoading(true);
      setModalError(null);

      try {
        setSelectedReceta(await fetchRecetaDetail(receta, token, logout));
      } catch (err: unknown) {
        setModalError(err instanceof Error ? err.message : 'Error desconocido al cargar la receta.');
      } finally {
        setIsModalLoading(false);
      }
    },
    [logout, token]
  );

  const handleRecetaClick = (receta: Receta) => {
    void loadRecetaDetail(receta);
  };

  return (
    <>
      <div className="space-y-6">
        <header className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-white">Recetas</h2>
          <p className="text-slate-400">
            Busca recetas por nombre. Los resultados aparecen 2 segundos después de dejar de escribir.
          </p>
        </header>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-citadel-accent/45 bg-slate-900/50 shadow-xl">
          <div className="flex items-center gap-3 border-b border-citadel-accent/30 px-4 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
              {recipesIcon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-100">Buscador de recetas</h3>
              {hasSearched && !isLoading && !error && debouncedQuery ? (
                <p className="text-xs text-slate-500">
                  {recetas.length} resultado{recetas.length !== 1 ? 's' : ''} para «{debouncedQuery}»
                </p>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 space-y-6 p-4 sm:p-6">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{searchIcon}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribe el nombre de la receta..."
                autoComplete="off"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {isWaitingForDebounce ? (
              <p className="text-center text-sm text-slate-500">Esperando a que termines de escribir...</p>
            ) : null}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
                <p className="text-sm text-slate-500">Buscando recetas...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-sm font-medium text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => void runSearch(debouncedQuery)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                >
                  Reintentar
                </button>
              </div>
            ) : !hasSearched || !debouncedQuery ? (
              <p className="py-10 text-center text-sm text-slate-500">Escribe en el buscador para encontrar recetas.</p>
            ) : recetas.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No se encontraron recetas que coincidan con «{debouncedQuery}».
              </p>
            ) : (
              <ul className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recetas.map((receta) => (
                  <li key={receta.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handleRecetaClick(receta)}
                      className="flex w-full min-w-0 max-w-full gap-3 overflow-hidden rounded-xl border border-citadel-accent/40 bg-slate-950/50 p-4 text-left transition-colors hover:border-cyan-500/30 hover:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:gap-4"
                    >
                      {receta.imagenUrl ? (
                        <img
                          src={receta.imagenUrl}
                          alt=""
                          width={48}
                          height={48}
                          loading="lazy"
                          decoding="async"
                          className="h-12 w-12 shrink-0 rounded-lg border border-slate-800 bg-slate-900 object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-600"
                          aria-hidden
                        >
                          ?
                        </div>
                      )}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate font-medium text-slate-200">{receta.nombre}</p>
                        {receta.nivel != null ? (
                          <p className="mt-1 text-xs text-slate-500">Nivel {receta.nivel}</p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {selectedReceta ? (
        <RecipeMaterialsModal
          receta={selectedReceta}
          isLoading={isModalLoading}
          error={modalError}
          onClose={() => {
            setSelectedReceta(null);
            setModalError(null);
          }}
          onRetry={() => {
            const receta = recetas.find((r) => r.id === selectedReceta.id);
            if (receta) void loadRecetaDetail(receta);
          }}
        />
      ) : null}
    </>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { lookupItemsByNames } from '../api/itemsApi';
import type { EventDrop } from '../api/eventsApi';

const DropItemImage = ({ imageUrl, name }: { imageUrl: string | null; name: string }) =>
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

const formatQuantity = (quantity: number) =>
  Number.isInteger(quantity) ? String(quantity) : quantity.toString();

interface EventDropsTableProps {
  drops: EventDrop[];
}

export const EventDropsTable: React.FC<EventDropsTableProps> = ({ drops }) => {
  const { token, logout } = useAuth();
  const [imageByName, setImageByName] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropNamesKey = useMemo(
    () => drops.map((drop) => drop.name).join('\u0000'),
    [drops]
  );

  useEffect(() => {
    if (drops.length === 0) {
      setImageByName({});
      setError(null);
      return;
    }

    let isCurrent = true;

    void lookupItemsByNames(
      token,
      logout,
      drops.map((drop) => drop.name)
    )
      .then((results) => {
        if (!isCurrent) return;

        const nextImageByName: Record<string, string | null> = {};
        for (const result of results) {
          nextImageByName[result.name.toLowerCase()] = result.imageUrl;
        }
        setImageByName(nextImageByName);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las imágenes.');
      })
      .finally(() => {
        if (!isCurrent) return;
        setIsLoading(false);
      });

    setIsLoading(true);

    return () => {
      isCurrent = false;
    };
  }, [dropNamesKey, drops, logout, token]);

  if (drops.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-200">Drops</h4>

      {error ? (
        <p className="text-xs text-amber-400">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/60">
        <table className="w-full text-xs">
          <caption className="sr-only">Drops del evento</caption>
          <thead className="bg-slate-900/80 text-slate-500">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium uppercase tracking-wider">
                Item
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium uppercase tracking-wider">
                Cantidad
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {drops.map((drop, index) => (
              <tr key={`${drop.name}-${index}`}>
                <td className="px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    {isLoading ? (
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-slate-800" />
                    ) : (
                      <DropItemImage
                        imageUrl={imageByName[drop.name.toLowerCase()] ?? null}
                        name={drop.name}
                      />
                    )}
                    <span className="min-w-0 truncate font-medium text-slate-200">{drop.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="inline-flex min-w-[2rem] justify-end rounded-md bg-slate-800 px-2 py-1 text-xs font-medium tabular-nums text-cyan-300">
                    {formatQuantity(drop.quantity)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

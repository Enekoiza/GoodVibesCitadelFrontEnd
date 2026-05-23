import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { PARTY_TYPES } from '../../party-builder/api/partyBuilderApi';
import { PartyAssignmentPreviewTable } from '../../party-builder/components/PartyAssignmentPreviewTable';
import {
  fetchAllEvents,
  getEventPartyPreviewRows,
  getEventTypeBadge,
  getPartyCompositionBadge,
  getPartyCompositionLabel,
  hasPartyComposition,
} from '../api/eventsApi';
import type { EventItem } from '../api/eventsApi';
import { CreateEventModal } from '../components/CreateEventModal';

const EVENT_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const calendarIcon = (
  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const plusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const refreshIconPath = (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
);

const errorIcon = (
  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const formatDateTime = (iso: string) => {
  try {
    return EVENT_DATE_FORMATTER.format(new Date(iso));
  } catch {
    return iso;
  }
};

const getEventKey = (event: EventItem) =>
  event.eventId || `${event.eventName}-${event.eventTime}-${event.username}`;

const getEventsErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Error desconocido al cargar los eventos.';

const closeIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EventsTable = memo(function EventsTable({
  events,
  onEventClick,
}: {
  events: EventItem[];
  onEventClick: (event: EventItem) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-800">
          <th scope="col" className="hidden">
            ID
          </th>
          <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Evento</th>
          <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tipo</th>
          <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Fecha y hora</th>
          <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Party Composition</th>
          <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Creado por</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/60">
        {events.map((event) => (
          <tr
            key={getEventKey(event)}
            onClick={() => onEventClick(event)}
            className="cursor-pointer transition-colors hover:bg-slate-800/40"
          >
            <td className="hidden" data-event-id={event.eventId}>
              {event.eventId}
            </td>
            <td className="py-3 pr-4 font-medium text-slate-200">{event.eventName}</td>
            <td className="py-3 pr-4">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getEventTypeBadge(event.eventType)}`}
              >
                {event.eventType}
              </span>
            </td>
            <td className="py-3 pr-4 text-slate-400">{formatDateTime(event.eventTime)}</td>
            <td className="py-3 pr-4">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPartyCompositionBadge(event.partyCompositions)}`}
              >
                {getPartyCompositionLabel(event.partyCompositions)}
              </span>
            </td>
            <td className="py-3 text-slate-400">{event.username}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export const EventsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setEvents(await fetchAllEvents(token, logout));
    } catch (err: unknown) {
      setError(getEventsErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    let isCurrent = true;

    void fetchAllEvents(token, logout)
      .then((nextEvents) => {
        if (!isCurrent) return;
        setEvents(nextEvents);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setError(getEventsErrorMessage(err));
      })
      .finally(() => {
        if (!isCurrent) return;
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [logout, token]);

  const filteredEvents = useMemo(() => {
    if (!typeFilter) return events;
    return events.filter((e) => e.eventType === typeFilter);
  }, [events, typeFilter]);

  return (
    <>
      <div className="space-y-6">
        <header className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-white">Eventos</h2>
          <p className="text-slate-400">Calendario y actividades del clan.</p>
        </header>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
          {/* Table header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                {calendarIcon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-100">Todos los eventos</h3>
                {!isLoading && !error ? (
                  <p className="text-xs text-slate-500">
                    {typeFilter
                      ? `${filteredEvents.length} de ${events.length} evento${events.length !== 1 ? 's' : ''}`
                      : `${events.length} evento${events.length !== 1 ? 's' : ''} registrado${events.length !== 1 ? 's' : ''}`}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 justify-center">
              <label htmlFor="events-type-filter" className="sr-only">
                Filtrar por tipo de evento
              </label>
              <select
                id="events-type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="max-w-[13rem] cursor-pointer rounded-lg border border-slate-700 bg-slate-950/80 py-2 pl-3 pr-8 text-xs font-medium text-slate-200 shadow-sm focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">Todos los tipos</option>
                {PARTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
              >
                {plusIcon}
                Crear nuevo evento
              </button>
              <button
                onClick={fetchEvents}
                disabled={isLoading}
                title="Recargar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
              >
                <svg
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {refreshIconPath}
                </svg>
              </button>
            </div>
          </div>

          {/* Table body */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
                <p className="text-sm text-slate-500">Cargando eventos...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  {errorIcon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-red-400">{error}</p>
                  <button
                    onClick={fetchEvents}
                    className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {filteredEvents.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    {typeFilter
                      ? `No hay eventos de tipo «${typeFilter}».`
                      : 'No hay eventos registrados todavía.'}
                  </p>
                ) : (
                  <EventsTable events={filteredEvents} onEventClick={setSelectedEvent} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedEvent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedEvent(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-100">
                  {hasPartyComposition(selectedEvent.partyCompositions)
                    ? selectedEvent.eventName
                    : 'Composición de party'}
                </h3>
                {hasPartyComposition(selectedEvent.partyCompositions) ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedEvent.eventType} · {formatDateTime(selectedEvent.eventTime)}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                aria-label="Cerrar modal"
              >
                {closeIcon}
              </button>
            </div>

            <div className="p-6">
              {hasPartyComposition(selectedEvent.partyCompositions) ? (
                <PartyAssignmentPreviewTable rows={getEventPartyPreviewRows(selectedEvent)} />
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">
                  Este evento no tiene ninguna composicion asignada.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isModalOpen ? (
        <CreateEventModal
          onClose={() => setIsModalOpen(false)}
          onCreated={fetchEvents}
        />
      ) : null}
    </>
  );
};

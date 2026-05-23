import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { Loader } from '../../../components/common/Loader';
import { hasRegisteredRoles } from '../../../constants';
import { useAuth } from '../../auth/context/AuthContext';
import { fetchAllEvents, getEventTypeBadge } from '../../events/api/eventsApi';
import type { EventItem } from '../../events/api/eventsApi';

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
});

const toDayKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const isSameMonth = (date: Date, month: Date) =>
  date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();

const buildMonthDays = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

  return [
    ...Array.from({ length: mondayFirstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ];
};

export const UpcomingEventsCard: React.FC = () => {
  const navigate = useNavigate();
  const { token, roles, logout } = useAuth();
  const canViewEventsPage = hasRegisteredRoles(roles);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [openedDay, setOpenedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = useMemo(() => new Date(), []);
  const days = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setEvents(await fetchAllEvents(token, logout));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los eventos.');
    } finally {
      setIsLoading(false);
    }
  }, [logout, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const eventsByDay = useMemo(() => {
    return events.reduce<Record<string, EventItem[]>>((acc, event) => {
      const eventDate = new Date(event.eventTime);
      if (Number.isNaN(eventDate.getTime()) || !isSameMonth(eventDate, currentMonth)) return acc;

      const dayKey = toDayKey(eventDate);
      acc[dayKey] = [...(acc[dayKey] ?? []), event];
      return acc;
    }, {});
  }, [currentMonth, events]);

  const openedEvents = openedDay ? eventsByDay[openedDay] ?? [] : [];
  const openedDate = openedDay ? new Date(`${openedDay}T00:00:00`) : null;
  const monthLabel = monthFormatter.format(currentMonth);

  return (
    <>
      <div
        className={`w-fit max-w-full ${canViewEventsPage ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (canViewEventsPage) navigate('/eventos');
        }}
      >
        <Card title="Futuros eventos" className="w-full">
          {isLoading ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Loader />
            </div>
          ) : error ? (
            <div onClick={(e) => e.stopPropagation()}>
              <ErrorMessage message={error} onRetry={fetchEvents} />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-sm font-medium capitalize text-slate-300">{monthLabel}</p>
                <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  {Object.keys(eventsByDay).length} día{Object.keys(eventsByDay).length !== 1 ? 's' : ''} con eventos
                </span>
              </div>

              <div className="overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                <div className="inline-grid min-w-full grid-cols-7 gap-1 text-center sm:w-max sm:min-w-0 sm:gap-2">
                {WEEK_DAYS.map((day) => (
                  <span
                    key={day}
                    className="flex h-9 w-9 items-center justify-center text-xs font-semibold uppercase text-slate-500 sm:h-10 sm:w-10"
                  >
                    {day}
                  </span>
                ))}

                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-9 w-9 sm:h-10 sm:w-10" aria-hidden />;
                  }

                  const dayKey = toDayKey(day);
                  const dayEvents = eventsByDay[dayKey] ?? [];
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => {
                        if (hasEvents) setOpenedDay(dayKey);
                      }}
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-all sm:h-10 sm:w-10 ${
                        hasEvents
                          ? 'border-orange-400/40 bg-orange-500/15 text-orange-200 hover:border-orange-300/70 hover:bg-orange-500/25'
                          : 'cursor-default border-slate-800 bg-slate-900/70 text-slate-500'
                      }`}
                      aria-label={`${day.getDate()} de ${monthLabel}${hasEvents ? `, ${dayEvents.length} eventos` : ', sin eventos'}`}
                    >
                      {day.getDate()}
                      {hasEvents && (
                        <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-orange-300" />
                      )}
                    </button>
                  );
                })}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {openedDay && openedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpenedDay(null);
          }}
        >
          <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100">Eventos del día</h3>
                <p className="mt-1 text-sm capitalize text-slate-500">
                  {openedDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenedDay(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                aria-label="Cerrar modal de eventos"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 space-y-3 overflow-y-auto p-4 custom-scrollbar sm:p-6">
              {openedEvents.map((event, index) => (
                <article
                  key={event.eventId || `${event.eventTime}-${event.eventName}-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-800/45 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-100">{event.eventName}</h4>
                    <span className="text-xs text-slate-500">{timeFormatter.format(new Date(event.eventTime))}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getEventTypeBadge(event.eventType)}`}
                    >
                      {event.eventType}
                    </span>
                    <span className="text-xs text-slate-400">Creado por {event.username}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

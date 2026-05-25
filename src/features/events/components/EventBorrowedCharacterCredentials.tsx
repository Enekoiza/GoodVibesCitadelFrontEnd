import React, { useEffect, useState } from 'react';
import { HoldToRevealPasswordDisplay } from '../../../components/common/HoldToRevealPasswordDisplay';
import { useAuth } from '../../auth/context/AuthContext';
import { formatCharacterLoginDisplay } from '../../characters/utils/characterFields';
import {
  eventTypeShowsBorrowedCredentials,
  fetchBorrowedCharacterCredentials,
  fetchBorrowedCharacterPassword,
} from '../api/eventsApi';
import type {
  BorrowedCharacterCredentials,
  BorrowedCharacterCredentialsResponse,
  BorrowedCredentialsVisibility,
  EventItem,
} from '../api/eventsApi';

const SCHEDULED_CREDENTIALS_MESSAGE =
  '2 horas antes del evento las credenciales serán visibles';

interface EventBorrowedCharacterCredentialsProps {
  event: EventItem;
}

export const EventBorrowedCharacterCredentials: React.FC<EventBorrowedCharacterCredentialsProps> = ({ event }) => {
  const { token, logout } = useAuth();
  const [visibility, setVisibility] = useState<BorrowedCredentialsVisibility>('none');
  const [credentials, setCredentials] = useState<BorrowedCharacterCredentials[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event.eventId || !eventTypeShowsBorrowedCredentials(event.eventType)) {
      setVisibility('none');
      setCredentials([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;

    setIsLoading(true);
    setError(null);

    void fetchBorrowedCharacterCredentials(event.eventId, token, logout)
      .then((response: BorrowedCharacterCredentialsResponse) => {
        if (!isCurrent) return;
        setVisibility(response.visibility);
        setCredentials(response.characters);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las credenciales.');
        setVisibility('none');
        setCredentials([]);
      })
      .finally(() => {
        if (!isCurrent) return;
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [event.eventId, event.eventType, logout, token]);

  if (!eventTypeShowsBorrowedCredentials(event.eventType)) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-200">Credenciales del personaje asignado</h4>
        <p className="text-sm text-slate-500">Cargando credenciales...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-200">Credenciales del personaje asignado</h4>
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      </section>
    );
  }

  if (visibility === 'none' || visibility === 'expired') {
    return null;
  }

  if (visibility === 'scheduled') {
    return (
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-200">Credenciales del personaje asignado</h4>
        <div className="space-y-3">
          {credentials.map((entry) => (
            <div
              key={entry.characterName}
              className="rounded-xl border border-citadel-accent/40 bg-slate-950/60 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{entry.characterName}</p>
                <p className="text-xs text-slate-500">Dueño: {entry.ownerUsername}</p>
              </div>
              <p className="text-sm text-slate-400">{SCHEDULED_CREDENTIALS_MESSAGE}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (credentials.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-200">Credenciales del personaje asignado</h4>
      <div className="space-y-3">
        {credentials.map((entry) => (
          <div
            key={entry.characterName}
            className="rounded-xl border border-citadel-accent/40 bg-slate-950/60 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-100">{entry.characterName}</p>
              <p className="text-xs text-slate-500">Dueño: {entry.ownerUsername}</p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Cuenta</dt>
                <dd className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
                  {formatCharacterLoginDisplay(entry.login)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Contraseña</dt>
                <dd>
                  <HoldToRevealPasswordDisplay
                    hasPassword={entry.hasPassword}
                    onReveal={async () =>
                      fetchBorrowedCharacterPassword(event.eventId, entry.characterName, token, logout)
                    }
                  />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
};

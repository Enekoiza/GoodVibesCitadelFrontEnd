import React, { useState } from 'react';
import { PartyAssignmentPreviewTable } from '../../party-builder/components/PartyAssignmentPreviewTable';
import {
  getEventPartyPreviewRows,
  hasPartyComposition,
} from '../api/eventsApi';
import type { EventItem } from '../api/eventsApi';
import { EventDropsEditor } from './EventDropsEditor';
import { EventDropsTable } from './EventDropsTable';
import { EventBorrowedCharacterCredentials } from './EventBorrowedCharacterCredentials';

const EVENT_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDateTime = (iso: string) => {
  try {
    return EVENT_DATE_FORMATTER.format(new Date(iso));
  } catch {
    return iso;
  }
};

const closeIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface EventDetailModalProps {
  event: EventItem;
  onClose: () => void;
  canEditDrops?: boolean;
  showBorrowedCharacterCredentials?: boolean;
  onDropsSaved?: (eventId: string, drops: EventItem['drops']) => void;
  className?: string;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  canEditDrops = false,
  showBorrowedCharacterCredentials = false,
  onDropsSaved,
  className = 'z-50',
}) => {
  const [isEditingDrops, setIsEditingDrops] = useState(false);

  const handleClose = () => {
    setIsEditingDrops(false);
    onClose();
  };

  const handleDropsSaved = (drops: EventItem['drops']) => {
    onDropsSaved?.(event.eventId, drops);
    setIsEditingDrops(false);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4 ${className}`}
      onClick={(clickEvent) => {
        if (clickEvent.target === clickEvent.currentTarget) handleClose();
      }}
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col rounded-2xl border border-citadel-accent/45 bg-slate-900 shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-citadel-accent/30 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-100">{event.eventName}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {event.eventType} · {formatDateTime(event.eventTime)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
            aria-label="Cerrar modal"
          >
            {closeIcon}
          </button>
        </div>

        <div className="min-h-0 space-y-6 overflow-y-auto p-4 sm:p-6">
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Composición de party</h4>
            {hasPartyComposition(event.partyCompositions) ? (
              <PartyAssignmentPreviewTable rows={getEventPartyPreviewRows(event)} />
            ) : (
              <p className="py-2 text-center text-sm text-slate-400">
                Este evento no tiene ninguna composicion asignada.
              </p>
            )}
          </section>

          {showBorrowedCharacterCredentials ? (
            <EventBorrowedCharacterCredentials event={event} />
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-200">Drops</h4>
              {canEditDrops && !isEditingDrops ? (
                <button
                  type="button"
                  onClick={() => setIsEditingDrops(true)}
                  className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
                >
                  Editar drops
                </button>
              ) : null}
            </div>

            {event.drops.length > 0 ? (
              <EventDropsTable drops={event.drops} />
            ) : (
              <p className="py-2 text-center text-sm text-slate-400">
                Este evento no tiene drops guardados.
              </p>
            )}
          </section>

          {canEditDrops && isEditingDrops ? (
            <EventDropsEditor
              eventId={event.eventId}
              initialDrops={event.drops}
              onSaved={handleDropsSaved}
              onClose={() => setIsEditingDrops(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { authenticatedFetch } from '../../auth/api/authFetch';
import { useAuth } from '../../auth/context/AuthContext';
import { EVENT_TYPES } from '../api/eventsApi';

const closeIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const toDatetimeLocalValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isNotInPast = (value: string) => {
  const selected = new Date(value);
  const now = new Date();
  selected.setSeconds(0, 0);
  now.setSeconds(0, 0);
  return selected >= now;
};

interface CreateEventModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreated }) => {
  const { token, username, logout } = useAuth();
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [minDateTime] = useState(() => toDatetimeLocalValue(new Date()));

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async () => {
    const trimmedEventName = eventName.trim();

    if (!trimmedEventName || !eventTime) return;

    if (!isNotInPast(eventTime)) {
      setDateError('La fecha es inválida.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setDateError(null);

    try {
      const response = await authenticatedFetch('/api/event/create', token, logout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: username,
          EventTime: new Date(eventTime).toISOString(),
          EventName: trimmedEventName,
          EventType: eventType,
        }),
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el evento.');
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = eventName.trim().length > 0 && eventTime.length > 0;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Crear nuevo evento</h3>
            <p className="mt-0.5 text-sm text-slate-500">Rellena los datos del evento del clan.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          >
            {closeIcon}
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Nombre del evento
            </span>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ej: Asedio a Fontera"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Fecha y hora
            </span>
            <input
              type="datetime-local"
              value={eventTime}
              min={minDateTime}
              onChange={(e) => {
                setEventTime(e.target.value);
                if (dateError) setDateError(null);
              }}
              className={`w-full rounded-lg border bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-500/60 [color-scheme:dark] ${
                dateError ? 'border-red-500/60' : 'border-slate-700'
              }`}
            />
            {dateError ? (
              <p className="mt-2 text-sm text-red-400">{dateError}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Tipo de evento
            </span>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-500/60"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !isValid}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-60"
          >
            {isSaving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

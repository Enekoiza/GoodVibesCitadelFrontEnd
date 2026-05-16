import { apiUrl } from '../../../config/api';

export interface EventItem {
  username: string;
  eventTime: string;
  eventName: string;
  eventType: string;
}

/** Tipos de evento soportados al crear y filtrar. */
export const EVENT_TYPES = [
  'Asedio',
  'Evento de farmeo',
  'Raid boss epico',
  'Raid boss regroup',
] as const;

export const EVENT_TYPE_STYLE: Record<string, string> = {
  'Asedio': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Evento de farmeo': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Raid boss epico': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'Raid boss regroup': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
};

export const getEventTypeBadge = (type: string) =>
  EVENT_TYPE_STYLE[type] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20';

const parseEventsResponse = async (response: Response): Promise<EventItem[]> => {
  const text = await response.text();
  if (!text.trim()) return [];

  const data: unknown = JSON.parse(text);
  if (data == null) return [];
  if (Array.isArray(data)) return data as EventItem[];
  return [];
};

export const fetchAllEvents = async (token: string | null): Promise<EventItem[]> => {
  if (!token) throw new Error('No hay sesión activa para cargar eventos.');

  const response = await fetch(apiUrl('/api/event/getAll'), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron cargar los eventos.`);
  return parseEventsResponse(response);
};

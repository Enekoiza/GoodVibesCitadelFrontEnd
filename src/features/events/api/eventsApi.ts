import { authenticatedFetch } from '../../auth/api/authFetch';

export interface PartyCompositionSlot {
  role: string;
  username: string;
  characterName: string;
}

export interface PartyComposition {
  owner: string;
  slots: PartyCompositionSlot[];
}

export interface EventItem {
  eventId: string;
  username: string;
  eventTime: string;
  eventName: string;
  eventType: string;
  partyCompositions: PartyComposition[];
}

export interface AttachPartyEventPayload {
  EventId: string;
  Username: string;
  EventTime: string;
  EventName: string;
  EventType: string;
}

export const toAttachPartyEvent = (event: EventItem): AttachPartyEventPayload => ({
  EventId: event.eventId,
  Username: event.username,
  EventTime: event.eventTime,
  EventName: event.eventName,
  EventType: event.eventType,
});

export interface AttachPartySlot {
  Role: string;
  Username: string;
  CharacterName: string;
}

export interface AttachPartyRequest {
  Event: AttachPartyEventPayload;
  AssignedByUsername: string;
  Slots: AttachPartySlot[];
  ReplaceExisting: boolean;
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

export const PARTY_COMPOSITION_READY_STYLE =
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
export const PARTY_COMPOSITION_ON_HOLD_STYLE = 'bg-blue-500/15 text-blue-400 border-blue-500/20';

export const hasPartyComposition = (partyCompositions: PartyComposition[]) =>
  partyCompositions.length > 0;

export const getPartyCompositionBadge = (partyCompositions: PartyComposition[]) =>
  hasPartyComposition(partyCompositions)
    ? PARTY_COMPOSITION_READY_STYLE
    : PARTY_COMPOSITION_ON_HOLD_STYLE;

export const getPartyCompositionLabel = (partyCompositions: PartyComposition[]) =>
  hasPartyComposition(partyCompositions) ? 'Ready' : 'On Hold';

export const getEventPartyPreviewRows = (event: EventItem) =>
  event.partyCompositions.flatMap((composition) =>
    composition.slots.map((slot) => ({
      role: slot.role,
      userName: slot.username,
      characterName: slot.characterName,
    }))
  );

type RawEventItem = {
  eventId?: string | number;
  EventId?: string | number;
  username?: string;
  Username?: string;
  eventTime?: string;
  EventTime?: string;
  eventName?: string;
  EventName?: string;
  eventType?: string;
  EventType?: string;
  parties?: unknown[];
  Parties?: unknown[];
  partyCompositionResponseDtos?: unknown[];
  PartyCompositionResponseDtos?: unknown[];
};

type RawPartyCompositionSlot = {
  role?: string;
  Role?: string;
  username?: string;
  Username?: string;
  characterName?: string;
  CharacterName?: string;
};

type RawPartyComposition = {
  owner?: string;
  Owner?: string;
  slots?: RawPartyCompositionSlot[];
  Slots?: RawPartyCompositionSlot[];
};

const normalizePartyCompositionSlot = (raw: RawPartyCompositionSlot): PartyCompositionSlot => ({
  role: String(raw.role ?? raw.Role ?? ''),
  username: String(raw.username ?? raw.Username ?? ''),
  characterName: String(raw.characterName ?? raw.CharacterName ?? ''),
});

const normalizePartyComposition = (raw: RawPartyComposition): PartyComposition => {
  const rawSlots = raw.slots ?? raw.Slots;
  const slots = Array.isArray(rawSlots) ? rawSlots.map(normalizePartyCompositionSlot) : [];

  return {
    owner: String(raw.owner ?? raw.Owner ?? ''),
    slots,
  };
};

const normalizePartyCompositions = (raw: RawEventItem): PartyComposition[] => {
  const value =
    raw.partyCompositionResponseDtos ??
    raw.PartyCompositionResponseDtos ??
    raw.parties ??
    raw.Parties;
  if (!Array.isArray(value)) return [];

  return value.map((item) => normalizePartyComposition(item as RawPartyComposition));
};

const normalizeEventItem = (raw: RawEventItem): EventItem => ({
  eventId: String(raw.eventId ?? raw.EventId ?? ''),
  username: String(raw.username ?? raw.Username ?? ''),
  eventTime: String(raw.eventTime ?? raw.EventTime ?? ''),
  eventName: String(raw.eventName ?? raw.EventName ?? ''),
  eventType: String(raw.eventType ?? raw.EventType ?? ''),
  partyCompositions: normalizePartyCompositions(raw),
});

const parseEventsResponse = async (response: Response): Promise<EventItem[]> => {
  const text = await response.text();
  if (!text.trim()) return [];

  const data: unknown = JSON.parse(text);
  if (data == null) return [];
  if (Array.isArray(data)) return data.map((item) => normalizeEventItem(item as RawEventItem));
  return [];
};

export const fetchAllEvents = async (token: string | null, logout: () => void): Promise<EventItem[]> => {
  const response = await authenticatedFetch('/api/event/getAll', token, logout, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron cargar los eventos.`);
  return parseEventsResponse(response);
};

export const attachPartyToEvent = async (
  token: string | null,
  logout: () => void,
  payload: AttachPartyRequest
): Promise<void> => {
  const response = await authenticatedFetch('/api/event/attachParty', token, logout, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Error ${response.status}: No se pudo asignar la party al evento.`);
};

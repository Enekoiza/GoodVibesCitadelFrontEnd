import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  formatDropsJson,
  updateEventDrops,
  validateDropsJson,
} from '../api/eventsApi';
import type { EventDrop } from '../api/eventsApi';

interface EventDropsEditorProps {
  eventId: string;
  initialDrops: EventDrop[];
  onSaved: (drops: EventDrop[]) => void;
  onClose?: () => void;
}

export const EventDropsEditor: React.FC<EventDropsEditorProps> = ({
  eventId,
  initialDrops,
  onSaved,
  onClose,
}) => {
  const { token, logout } = useAuth();
  const [jsonText, setJsonText] = useState(() => formatDropsJson(initialDrops));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setJsonText(formatDropsJson(initialDrops));
    setValidationError(null);
    setSaveError(null);
  }, [eventId, initialDrops]);

  const handleSave = async () => {
    setSaveError(null);
    const result = validateDropsJson(jsonText);
    if (!result.ok) {
      setValidationError(result.error);
      return;
    }

    setValidationError(null);
    setIsSaving(true);

    try {
      await updateEventDrops(token, logout, {
        EventId: eventId,
        Drops: result.drops.map((drop) => ({
          Name: drop.name,
          Quantity: drop.quantity,
        })),
      });
      onSaved(result.drops);
      onClose?.();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'No se pudieron guardar los drops.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4 border-t border-citadel-accent/30 pt-6">
      <div>
        <p className="text-xs text-slate-500">
          Pega un JSON con la lista de materiales y sus cantidades. Ejemplo:{' '}
          <code className="text-slate-400">[{'{ "name": "Avadon Robe Fabric", "quantity": 5 }'}]</code>
        </p>
      </div>

      <textarea
        value={jsonText}
        onChange={(event) => {
          setJsonText(event.target.value);
          setValidationError(null);
          setSaveError(null);
        }}
        rows={8}
        spellCheck={false}
        placeholder={'[\n  { "name": "Avadon Robe Fabric", "quantity": 5 }\n]'}
        className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      />

      {validationError ? (
        <p className="text-xs text-red-400">{validationError}</p>
      ) : null}
      {saveError ? (
        <p className="text-xs text-red-400">{saveError}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {initialDrops.length > 0
            ? `${initialDrops.length} material${initialDrops.length !== 1 ? 'es' : ''} guardado${initialDrops.length !== 1 ? 's' : ''}`
            : 'Sin drops guardados todavía'}
        </p>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="rounded-lg bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/25 disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar drops'}
        </button>
      </div>
    </section>
  );
};

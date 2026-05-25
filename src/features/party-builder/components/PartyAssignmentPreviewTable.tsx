import React from 'react';
import { getPartyRoleBadgeClassName } from '../constants/partyRoles';

export interface PartyAssignmentPreviewRow {
  role: string;
  userName: string;
  characterName: string;
}

interface PartyAssignmentPreviewTableProps {
  rows: PartyAssignmentPreviewRow[];
}

export const PartyAssignmentPreviewTable: React.FC<PartyAssignmentPreviewTableProps> = ({ rows }) => (
  <div className="overflow-hidden rounded-xl border border-citadel-accent/40 bg-slate-950/60">
    <table className="w-full text-xs">
      <caption className="sr-only">Composición de party</caption>
      <thead className="bg-slate-900/80 text-slate-500">
        <tr>
          <th scope="col" className="px-3 py-2 text-left font-medium uppercase tracking-wider">
            Rol
          </th>
          <th scope="col" className="px-3 py-2 text-left font-medium uppercase tracking-wider">
            Usuario
          </th>
          <th scope="col" className="px-3 py-2 text-left font-medium uppercase tracking-wider">
            Personaje
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-citadel-accent/25">
        {rows.map((row, index) => (
          <tr key={`${row.role}-${row.userName}-${row.characterName}-${index}`}>
            <td className="px-3 py-2">
              <span
                className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getPartyRoleBadgeClassName(row.role)}`}
              >
                {row.role}
              </span>
            </td>
            <td className="px-3 py-2 font-medium text-slate-200">{row.userName}</td>
            <td className="px-3 py-2 text-slate-300">{row.characterName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

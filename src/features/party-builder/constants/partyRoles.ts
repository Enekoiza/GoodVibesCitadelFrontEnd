export const partyRoleFields = [
  { key: 'dpsCount', label: 'dps', className: 'border-red-500/20 bg-red-500/15 text-red-400' },
  { key: 'bishopCount', label: 'bishop', className: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-400' },
  { key: 'bardCount', label: 'bard', className: 'border-violet-500/20 bg-violet-500/15 text-violet-400' },
  { key: 'bufferCount', label: 'buffer', className: 'border-amber-500/20 bg-amber-500/15 text-amber-400' },
  { key: 'tankCount', label: 'tank', className: 'border-cyan-500/20 bg-cyan-500/15 text-cyan-400' },
  { key: 'rechargerCount', label: 'recharger', className: 'border-blue-500/20 bg-blue-500/15 text-blue-400' },
] as const;

export const getPartyRoleBadgeClassName = (role: string) => {
  const normalized = role.trim().toLowerCase();
  const field = partyRoleFields.find((entry) => entry.label === normalized);
  return field?.className ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20';
};

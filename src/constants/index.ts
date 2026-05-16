export const ADMIN_ROLES = ['CP Admin', 'Admin'];

/** Shown in the UI when the JWT has no role claims (user pending assignment in DB). */
export const WAITING_ROLE = 'Waiting';

/** True if the user has CP Admin or Admin (panel + rutas /admin). */
export function hasAdminRole(roles: string[]): boolean {
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

/** True if the JWT includes at least one role (user is not in pending / Waiting state). */
export function hasRegisteredRoles(roles: string[]): boolean {
  return roles.length > 0;
}

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import { useAuth } from '../../features/auth/context/AuthContext';
import { hasAdminRole } from '../../constants';

export const Sidebar: React.FC = () => {
  const { username, role, roles, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const displayUsername = username || 'Miembro';
  const displayRole = role || '';
  const initial = displayUsername.charAt(0).toUpperCase();
  const isAdmin = hasAdminRole(roles);
  const isWaitingUser = roles.length === 0;

  const isActive = (path: string) => location.pathname === path;

  const roleClassName = isWaitingUser ? 'text-xs text-amber-400/90' : 'text-xs text-slate-500';

  const UserBlock = ({ className }: { className?: string }) => (
    <div className={`relative ${className ?? ''}`}>
      {showLogout && (
        <div className="absolute bottom-full left-4 right-4 mb-2 w-auto max-w-none rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-lg md:left-4 md:right-auto md:w-56">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-slate-700/50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowLogout(!showLogout)}
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-800"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold text-slate-300">
          {initial}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium text-slate-200">{displayUsername}</p>
          <p className={roleClassName}>{displayRole}</p>
        </div>
      </button>
    </div>
  );

  const BrandHeader = ({ className }: { className?: string }) => (
    <div className={`flex h-16 items-center border-b border-slate-800 px-4 ${className ?? ''}`}>
      <div className="flex min-w-0 items-center gap-3">
        <img src={logoUrl} alt="Good Vibes Citadel Logo" className="h-10 w-auto shrink-0 md:h-10" />
        <h1 className="truncate text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-orange-500">
          Good Vibes Citadel
        </h1>
      </div>
    </div>
  );

  return (
    <>
      {/* Móvil: mismo “marco” que el sidebar (marca arriba, usuario abajo), sin enlaces */}
      {isWaitingUser && (
        <>
          <header className="fixed inset-x-0 top-0 z-30 bg-slate-900 md:hidden">
            <BrandHeader />
          </header>
          <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900 px-2 py-2 md:hidden">
            <UserBlock />
          </footer>
        </>
      )}

      <aside className="hidden h-full w-64 shrink-0 border-r border-slate-800 bg-slate-900 transition-all duration-300 md:flex md:flex-col">
        <BrandHeader />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
          {!isWaitingUser ? (
            <>
              <nav className="shrink-0 space-y-1" aria-label="Navegación principal">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Panel Principal
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/eventos');
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/eventos')
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Eventos
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/miembros');
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/miembros')
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Miembros
                </a>
              </nav>

              {isAdmin ? (
                <div className="flex min-h-0 flex-1 flex-col justify-center py-6">
                  <div className="border-t border-slate-800/90 pt-6">
                    <nav className="space-y-1" aria-label="Administración">
                      <div>
                        <button
                          type="button"
                          onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                            adminDropdownOpen
                              ? 'bg-orange-500/10 text-orange-400'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          <span className="flex-1 text-left">Panel de Administrador</span>
                          <svg
                            className={`h-4 w-4 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {adminDropdownOpen ? (
                          <div className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-4">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate('/admin/membership');
                              }}
                              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                isActive('/admin/membership')
                                  ? 'bg-orange-500/10 text-orange-400'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Administración de miembros
                            </a>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate('/admin/roles');
                              }}
                              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                isActive('/admin/roles')
                                  ? 'bg-orange-500/10 text-orange-400'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              Administración de Roles
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </nav>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex-1" aria-hidden />
          )}
        </div>

        <div className="relative border-t border-slate-800 p-4">
          <UserBlock />
        </div>
      </aside>
    </>
  );
};

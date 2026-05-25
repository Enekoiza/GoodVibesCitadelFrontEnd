import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import { useAuth } from '../../features/auth/context/AuthContext';
import { canAccessAccountSettings, hasAdminRole } from '../../constants';

const mainNavItems = [
  {
    path: '/',
    label: 'Panel Principal',
    iconPath:
      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    path: '/eventos',
    label: 'Eventos',
    iconPath:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    path: '/miembros',
    label: 'Miembros',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    path: '/party-builder',
    label: 'Constructor de party',
    iconPath:
      'M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h3m5-10a4 4 0 110 8 4 4 0 010-8zM7 8a3 3 0 110 6 3 3 0 010-6zm10 0a3 3 0 110 6 3 3 0 010-6z',
  },
  {
    path: '/recetas',
    label: 'Recetas',
    iconPath:
      'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    path: '/cp-warehouse',
    label: 'CP Warehouse',
    iconPath:
      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
];

const adminIconPath =
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';

const adminNavItems = [
  {
    path: '/admin/membership',
    label: 'Administración de miembros',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    path: '/admin/roles',
    label: 'Administración de Roles',
    iconPath: adminIconPath,
  },
];

export const Sidebar: React.FC = () => {
  const { username, role, roles, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const displayUsername = username || 'Miembro';
  const displayRole = role || '';
  const initial = displayUsername.charAt(0).toUpperCase();
  const isAdmin = hasAdminRole(roles);
  const isWaitingUser = roles.length === 0;
  const showAccountSettings = canAccessAccountSettings(roles);

  const isActive = (path: string) => location.pathname === path;
  const navigateTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const roleClassName = isWaitingUser ? 'text-xs text-amber-400/90' : 'text-xs text-slate-500';

  const renderNavIcon = (path: string, className = 'h-5 w-5') => (
    <svg className={`${className} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );

  const renderNavButton = ({
    path,
    label,
    iconPath,
    tone = 'cyan',
    compact = false,
  }: {
    path: string;
    label: string;
    iconPath: string;
    tone?: 'cyan' | 'orange';
    compact?: boolean;
  }) => {
    const active = isActive(path);
    const activeClassName =
      tone === 'orange' ? 'bg-orange-500/10 text-orange-400' : 'bg-cyan-500/10 text-cyan-400';
    const inactiveClassName = 'text-slate-400 hover:bg-slate-800 hover:text-slate-200';

    return (
      <button
        key={path}
        type="button"
        onClick={() => navigateTo(path)}
        className={`flex w-full items-center gap-3 rounded-xl text-left text-sm font-medium transition-colors ${
          compact ? 'px-4 py-2.5' : 'px-4 py-3'
        } ${active ? activeClassName : inactiveClassName}`}
      >
        {renderNavIcon(iconPath, compact ? 'h-4 w-4' : 'h-5 w-5')}
        {label}
      </button>
    );
  };

  const renderNavigation = () => (
    <>
      <nav className="shrink-0 space-y-1" aria-label="Navegación principal">
        {mainNavItems.map((item) => renderNavButton(item))}
      </nav>

      {isAdmin ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center py-6">
          <div className="border-t border-slate-800/90 pt-6">
            <nav className="space-y-1" aria-label="Administración">
              <button
                type="button"
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  adminDropdownOpen
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                aria-expanded={adminDropdownOpen}
              >
                {renderNavIcon(adminIconPath)}
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
                  {adminNavItems.map((item) => renderNavButton({ ...item, compact: true, tone: 'orange' }))}
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );

  const renderUserBlock = (className?: string) => (
    <div className={`relative ${className ?? ''}`}>
      {showUserMenu && (
        <div className="absolute bottom-full left-4 right-4 mb-2 w-auto max-w-none rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-lg md:left-4 md:right-auto md:w-56">
          {showAccountSettings ? (
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(false);
                navigateTo('/cuenta');
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-slate-700/50 ${
                isActive('/cuenta') ? 'text-cyan-400' : 'text-slate-300'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ajustes de cuenta
            </button>
          ) : null}
          {showAccountSettings ? <div className="my-1 border-t border-slate-700" /> : null}
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(false);
              setMobileMenuOpen(false);
              logout();
            }}
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
        onClick={() => setShowUserMenu(!showUserMenu)}
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

  const renderBrandHeader = (className?: string) => (
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
      <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-800 bg-slate-900 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={logoUrl} alt="Good Vibes Citadel Logo" className="h-8 w-auto shrink-0" />
            <h1 className="truncate bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-lg font-bold text-transparent">
              Good Vibes Citadel
            </h1>
          </div>

          {!isWaitingUser ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              aria-label={mobileMenuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          ) : null}
        </div>
      </header>

      {isWaitingUser ? (
        <>
          <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900 px-2 py-2 md:hidden">
            {renderUserBlock()}
          </footer>
        </>
      ) : (
        mobileMenuOpen && (
          <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto border-t border-slate-800 bg-slate-900 px-4 py-5 shadow-2xl md:hidden">
            <div className="flex-1">
              {renderNavigation()}
            </div>
            <div className="border-t border-slate-800 pt-3">
              {renderUserBlock()}
            </div>
          </div>
        )
      )}

      <aside className="hidden h-full w-64 shrink-0 border-r border-slate-800 bg-slate-900 transition-all duration-300 md:flex md:flex-col">
        {renderBrandHeader()}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
          {!isWaitingUser ? renderNavigation() : <div className="flex-1" aria-hidden />}
        </div>

        <div className="relative border-t border-slate-800 p-4">
          {renderUserBlock()}
        </div>
      </aside>
    </>
  );
};

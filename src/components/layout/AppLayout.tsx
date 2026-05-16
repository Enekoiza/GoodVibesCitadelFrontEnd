import React from 'react';
import { Sidebar } from './Sidebar';
import logoUrl from '../../assets/logo.png';
import { useAuth } from '../../features/auth/context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { roles } = useAuth();
  const isWaitingUser = roles.length === 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto bg-slate-950 ${
          isWaitingUser ? 'pt-14 pb-28 md:pt-0 md:pb-0' : ''
        }`}
      >
        {/* Mobile header — opciones solo cuando ya tiene roles asignados */}
        {!isWaitingUser && (
          <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 md:hidden">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Good Vibes Citadel Logo" className="h-8 w-auto" />
              <h1 className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-lg font-bold text-transparent">
                Good Vibes Citadel
              </h1>
            </div>
            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>
        )}

        <div className="p-6 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
};

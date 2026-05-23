import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../features/auth/context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { roles } = useAuth();
  const isWaitingUser = roles.length === 0;
  const mobileChromePadding = isWaitingUser ? 'pt-16 pb-28 md:pt-0 md:pb-0' : 'pt-16 md:pt-0';

  return (
    <div className="flex h-dvh min-h-dvh w-full overflow-hidden bg-slate-950 font-sans text-slate-100">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto bg-slate-950 ${mobileChromePadding}`}
      >
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
};

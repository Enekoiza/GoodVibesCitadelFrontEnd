import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { AccountCharactersCard } from '../components/AccountCharactersCard';

export const AccountSettingsPage: React.FC = () => {
  const { username, role } = useAuth();
  const displayUsername = username ?? 'Usuario';

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Ajustes de cuenta</h2>
        <p className="text-slate-400">
          Configuración personal de <span className="font-medium text-slate-300">{displayUsername}</span>
          {role ? (
            <>
              {' '}
              · <span className="text-slate-500">{role}</span>
            </>
          ) : null}
        </p>
      </header>

      <AccountCharactersCard />
    </div>
  );
};

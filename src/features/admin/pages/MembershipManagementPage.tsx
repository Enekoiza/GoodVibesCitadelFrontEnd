import React from 'react';
import { UsersCard } from '../components/UsersCard';

export const MembershipManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Administración de miembros</h2>
        <p className="text-slate-400">Administra los miembros y usuarios del clan.</p>
      </header>

      <UsersCard />
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../../config/api';
import { useAuth } from '../context/AuthContext';
import logoUrl from '../../../assets/logo.png';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-11 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          title={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition-colors hover:text-slate-300"
        >
          {isVisible ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.56 0 3.04-.338 4.373-.946M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l12.544 12.544M21 21l-3.228-3.228M9.879 9.879a3 3 0 104.242 4.242" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
};

interface TemporaryPasswordModalProps {
  username: string;
  onPasswordUpdated: () => void;
}

const TemporaryPasswordModal: React.FC<TemporaryPasswordModalProps> = ({
  username,
  onPasswordUpdated,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [repeatedOldPassword, setRepeatedOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (oldPassword !== repeatedOldPassword) {
      setError('Las contraseñas actuales no coinciden.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(apiUrl('/api/auth/updatePassword'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo actualizar la contraseña.`);
      }

      onPasswordUpdated();
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-100">Actualizar contraseña</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Actualiza tu contraseña temporal para continuar.
          </p>
        </div>

        <form onSubmit={handleSave}>
          <div className="space-y-4 px-6 py-5">
            <PasswordInput
              id="current-password"
              label="Contrasenia actual"
              value={oldPassword}
              onChange={setOldPassword}
            />
            <PasswordInput
              id="repeat-current-password"
              label="Repite la contrasenia actual"
              value={repeatedOldPassword}
              onChange={setRepeatedOldPassword}
            />
            <PasswordInput
              id="new-password"
              label="Nueva contrasenia"
              value={newPassword}
              onChange={setNewPassword}
            />

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end border-t border-slate-800 px-6 py-4">
            <button
              type="submit"
              disabled={isSaving || !oldPassword || !repeatedOldPassword || !newPassword}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2 text-sm font-medium text-white shadow transition-all hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-60"
            >
              {isSaving && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [temporaryPasswordUsername, setTemporaryPasswordUsername] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loginUsername = username.trim();
      await login(loginUsername, password);

      const temporaryPasswordResponse = await fetch(apiUrl('/api/auth/verifyTemporaryPassword'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginUsername }),
      });

      if (temporaryPasswordResponse.ok) {
        navigate('/');
        return;
      }

      if (temporaryPasswordResponse.status === 400) {
        setTemporaryPasswordUsername(loginUsername);
        return;
      }

      throw new Error(`Error ${temporaryPasswordResponse.status}: No se pudo verificar la contraseña temporal.`);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdated = () => {
    setTemporaryPasswordUsername(null);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 font-sans text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logoUrl} alt="Good Vibes Citadel Logo" className="mb-4 h-20 w-auto" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-orange-500">
            Good Vibes Citadel
          </h1>
          <p className="mt-2 text-sm text-slate-400">Introduce tus credenciales para acceder</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <PasswordInput
            id="password"
            label="Contraseña"
            value={password}
            onChange={setPassword}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-cyan-400 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Conectando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>

      {temporaryPasswordUsername && (
        <TemporaryPasswordModal
          username={temporaryPasswordUsername}
          onPasswordUpdated={handlePasswordUpdated}
        />
      )}
    </div>
  );
};

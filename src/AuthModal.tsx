import React, { useState } from 'react';
import { useAuth } from './useAuth';

export const AuthModal: React.FC = () => {
  const { login, register, error, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.username) {
          setLocalError('El nombre de usuario es obligatorio');
          return;
        }
        await register(form.username, form.email, form.password);
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              name="username"
              type="text"
              placeholder="Nombre de usuario"
              value={form.username}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              autoComplete="username"
              required
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            autoComplete="email"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />
          {(error || localError) && <div className="text-red-600 text-sm">{error || localError}</div>}
          <button
            type="submit"
            className="bg-[#00a753] text-white font-bold py-2 rounded hover:bg-[#07882c] transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-[#00a753] underline text-sm hover:text-green-700"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};
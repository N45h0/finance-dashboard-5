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
        
        {/* FORMULARIO DE EMAIL Y CONTRASEÑA */}
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

        {/* --- INICIO DE LA SECCIÓN AÑADIDA --- */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">O continúa con</span>
          </div>
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL}/auth/google/login`}
          className="flex w-full items-center justify-center gap-3 border rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Iniciar sesión con Google"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.341-11.303-8H6.393c3.562 7.745 11.758 13 20.107 13h-2.5z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.447-2.274 4.467-4.177 5.98l6.19 5.238C39.999 36.697 44 31.134 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          <span>Continuar con Google</span>
        </a>
        {/* --- FIN DE LA SECCIÓN AÑADIDA --- */}
        
        {/* BOTÓN PARA CAMBIAR ENTRE LOGIN Y REGISTRO */}
        <div className="mt-6 text-center">
          <button
            className="text-[#00a753] underline text-sm hover:text-green-700"
            onClick={() => {
              setIsLogin(!isLogin);
              setLocalError(null);
            }}
            type="button"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};
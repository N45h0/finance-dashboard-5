import React, { useEffect, useState } from 'react';
import { api } from './api';

interface Account {
  id: number;
  account_name: string;
  card: string;
  balance: number;
}

export const CuentasPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ account_name: '', card: '', balance: '' });

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAccount({
        account_name: form.account_name,
        card: form.card,
        balance: Number(form.balance),
      });
      setForm({ account_name: '', card: '', balance: '' });
      setShowForm(false);
      fetchAccounts();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Cuentas</p>
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Crear cuenta</span>
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-2 bg-white rounded shadow max-w-md mb-4">
          <input name="account_name" value={form.account_name} onChange={handleChange} placeholder="Nombre de la cuenta" className="border rounded px-3 py-2" required />
          <input name="card" value={form.card} onChange={handleChange} placeholder="Número de tarjeta/cuenta" className="border rounded px-3 py-2" required />
          <input name="balance" value={form.balance} onChange={handleChange} placeholder="Saldo inicial" type="number" className="border rounded px-3 py-2" required />
          <div className="flex gap-2">
            <button type="submit" className="bg-[#00a753] text-white font-bold py-2 rounded hover:bg-[#07882c] flex-1">Guardar</button>
            <button type="button" className="bg-gray-200 text-black font-bold py-2 rounded flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="p-4">Cargando...</div>
      ) : error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : (
        <div className="px-4 py-3 @container">
          <div id="cuentas-table" className="flex overflow-hidden rounded-xl border border-[#d7e0db] bg-[#f9fbfa]">
            <table className="flex-1">
              <thead>
                <tr className="bg-[#f9fbfa]">
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Nombre</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Número</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id} className="border-t border-t-[#d7e0db]">
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#121714] text-sm font-normal leading-normal">{acc.account_name}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{acc.card}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">${acc.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

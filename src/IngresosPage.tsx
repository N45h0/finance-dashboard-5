import React, { useEffect, useState } from 'react';
import { api } from './api';

interface Income {
  id: number;
  income_name: string;
  income_date: string;
  description: string;
  category: string;
  amount: number;
  account_id: number;
}

export const IngresosPage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ income_name: '', income_date: '', description: '', category: '', amount: '', account_id: '' });

  const fetchIncomes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIncomes();
      setIncomes(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIncome({
        income_name: form.income_name,
        income_date: form.income_date,
        description: form.description,
        category: form.category,
        amount: Number(form.amount),
        account_id: Number(form.account_id),
      });
      setForm({ income_name: '', income_date: '', description: '', category: '', amount: '', account_id: '' });
      setShowForm(false);
      fetchIncomes();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Ingresos</p>
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Nuevo ingreso</span>
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-2 bg-white rounded shadow max-w-md mb-4">
          <input name="income_name" value={form.income_name} onChange={handleChange} placeholder="Nombre del ingreso" className="border rounded px-3 py-2" required />
          <input name="income_date" value={form.income_date} onChange={handleChange} placeholder="Fecha (YYYY-MM-DD)" className="border rounded px-3 py-2" required />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border rounded px-3 py-2" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Categoría" className="border rounded px-3 py-2" required />
          <input name="amount" value={form.amount} onChange={handleChange} placeholder="Monto" type="number" className="border rounded px-3 py-2" required />
          <input name="account_id" value={form.account_id} onChange={handleChange} placeholder="ID de cuenta" type="number" className="border rounded px-3 py-2" required />
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
          <div id="ingresos-table" className="flex overflow-hidden rounded-xl border border-[#d7e0db] bg-[#f9fbfa]">
            <table className="flex-1">
              <thead>
                <tr className="bg-[#f9fbfa]">
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Nombre</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Fecha</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Categoría</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Monto</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Descripción</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Cuenta</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map(inc => (
                  <tr key={inc.id} className="border-t border-t-[#d7e0db]">
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#121714] text-sm font-normal leading-normal">{inc.income_name}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{inc.income_date}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{inc.category}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">${inc.amount}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{inc.description}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{inc.account_id}</td>
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

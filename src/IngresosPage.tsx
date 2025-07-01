import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Account } from './CuentasPage';
import { formatDate } from './utils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from './useAuth';

interface Income {
  id: number;
  income_name: string;
  income_date: string;
  description: string;
  category: string;
  amount: number;
  account_id: number;
}

const initialFormState = { income_name: '', income_date: '', description: '', category: '', amount: '', account_id: '' };

export const IngresosPage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ income_name: '', income_date: '', description: '', category: '', amount: 0, account_id: 0 });
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const { token } = useAuth();

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

  const fetchAccounts = async () => {
    try {
      const accountsData = await api.getAccounts();
      setAvailableAccounts(accountsData);
      if (accountsData.length > 0) {
        setForm(prev => ({ ...prev, account_id: accountsData[0].id.toString() }));
      }
    } catch (e) {
      console.error("Error al cargar las cuentas", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchIncomes();
      fetchAccounts();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // 1. Hacemos una aserción de tipo para que TypeScript sepa qué es e.target
    const target = e.target as HTMLInputElement;

    // 2. Determinamos el valor correcto dependiendo del tipo de input
    const value = target.type === 'number' ? target.valueAsNumber : target.value;

    // 3. Actualizamos el estado del formulario
    setEditForm({ ...editForm, [target.name]: value });
  };
  const startEdit = (inc: Income) => {
    setEditId(inc.id);
    setEditForm({
      income_name: inc.income_name,
      income_date: new Date(inc.income_date).toISOString().split('T')[0],
      description: inc.description,
      category: inc.category,
      amount: inc.amount,
      account_id: inc.account_id,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_id || !form.income_date) {
        setError("Debes seleccionar una cuenta y una fecha.");
        return;
    }
    setError(null);
    try {
      await api.createIncome({
        ...form,
        amount: Number(form.amount),
        account_id: Number(form.account_id),
      });
      setForm(initialFormState);
      setShowForm(false);
      fetchIncomes();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await api.updateIncome(editId, {
          ...editForm,
          amount: Number(editForm.amount),
          account_id: Number(editForm.account_id),
      });
      setEditId(null);
      fetchIncomes();
    } catch (err: any) {
      setError("Error al actualizar el ingreso");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este ingreso?")) {
      try {
        await api.deleteIncome(id);
        fetchIncomes();
      } catch (err: any) {
        setError("Error al eliminar el ingreso");
      }
    }
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Ingresos</p>
        <button
          className="flex w-full md:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Nuevo ingreso</span>
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-md max-w-lg mb-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Registrar Nuevo Ingreso</h3>
          <input name="income_name" value={form.income_name} onChange={handleChange} placeholder="Nombre del ingreso" className="border rounded px-3 py-2" required />
          <DatePicker
            selected={form.income_date ? new Date(form.income_date) : null}
            onChange={(date) => setForm(prev => ({ ...prev, income_date: date?.toISOString().split('T')[0] || '' }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className="border rounded px-3 py-2 w-full"
            locale="es"
            required
          />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border rounded px-3 py-2" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Categoría" className="border rounded px-3 py-2" required />
          <input name="amount" value={form.amount} onChange={handleChange} placeholder="Monto" type="number" className="border rounded px-3 py-2" required />
          <select name="account_id" value={form.account_id} onChange={handleChange} className="border rounded px-3 py-2 bg-white" required>
            <option value="" disabled>-- Asociar a una cuenta --</option>
            {availableAccounts.map(account => (
              <option key={account.id} value={account.id}>{account.account_name}</option>
            ))}
          </select>
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
        <div className="w-full px-4 py-3">
          {/* VISTA DE TABLA PARA ESCRITORIO */}
          <div className="hidden lg:flex overflow-hidden rounded-xl border border-[#d7e0db] bg-[#f9fbfa]">
            <table className="flex-1" id="ingresos-table">
              <thead>
                <tr className="bg-[#f9fbfa]">
                  <th className="px-4 py-3 text-left text-[#121714] w-[300px] text-sm font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[150px] text-sm font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[200px] text-sm font-medium">Categoría</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[150px] text-sm font-medium">Monto</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[150px] text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map(inc => (
                  <tr key={inc.id} className="border-t border-t-[#d7e0db]">
                    { editId === inc.id ? (
                      <td colSpan={5} className="p-2">
                        <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
                          <input name="income_name" value={editForm.income_name} onChange={handleEditChange} className="border rounded px-2 py-1 flex-1" />
                          <input name="category" value={editForm.category} onChange={handleEditChange} className="border rounded px-2 py-1 flex-1" />
                          <input name="amount" value={editForm.amount} onChange={handleEditChange} type="number" className="border rounded px-2 py-1 w-28" />
                          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Guardar</button>
                          <button type="button" onClick={() => setEditId(null)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancelar</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="h-[72px] px-4 py-2 text-[#121714]">{inc.income_name}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{formatDate(inc.income_date)}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{inc.category}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273] font-medium">${inc.amount.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2">
                          <button onClick={() => startEdit(inc)} className="text-sm text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDelete(inc.id)} className="text-sm text-red-600 hover:underline ml-4">Eliminar</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* VISTA DE TARJETAS PARA MÓVIL */}
          <div className="block lg:hidden space-y-4">
            {incomes.map(inc => (
              <div key={inc.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start">
                    <span className="font-bold text-lg text-[#121714]">{inc.income_name}</span>
                    <span className="text-lg font-bold text-green-600">${inc.amount.toLocaleString()}</span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-gray-600">Categoría:</span> {inc.category}</p>
                    <p><span className="text-gray-600">Fecha:</span> {formatDate(inc.income_date)}</p>
                </div>
                <div className="mt-4 pt-2 border-t flex justify-end gap-4">
                    <button onClick={() => startEdit(inc)} className="text-sm text-blue-600 font-medium">Editar</button>
                    <button onClick={() => handleDelete(inc.id)} className="text-sm text-red-600 font-medium">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
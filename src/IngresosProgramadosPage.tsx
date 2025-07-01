import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";
import { Account } from "./CuentasPage";
import { formatDate } from "./utils";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface IngresoProgramado {
  id: number;
  income_name: string;
  income_date: string;
  description: string;
  category: string;
  next_income: string;
  amount: number;
  received_amount: number;
  pending_amount: number;
  account_id: number;
}

const initialState = {
    income_name: '',
    income_date: '',
    description: '',
    category: '',
    next_income: '',
    amount: '',
    received_amount: '',
    pending_amount: '',
    account_id: ''
};

export const IngresosProgramadosPage: React.FC = () => {
  const [ingresos, setIngresos] = useState<IngresoProgramado[]>([]);
  const [form, setForm] = useState(initialState);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<IngresoProgramado, 'id' | 'user_id'>>({ ...initialState, amount: 0, received_amount: 0, pending_amount: 0, account_id: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);

  const fetchIngresos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getScheduledIncomes();
      setIngresos(data);
    } catch (err: any) {
      setError("Error al cargar ingresos programados");
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
    } catch (e) { console.error("Error al cargar las cuentas", e); }
  };

  useEffect(() => {
    if (token) {
        fetchIngresos();
        fetchAccounts();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_id || !form.income_date || !form.next_income) {
        setError("Por favor, completa todos los campos requeridos.");
        return;
    }
    setError(null);
    try {
      await api.createScheduledIncome({
        ...form,
        amount: Number(form.amount),
        received_amount: Number(form.received_amount),
        pending_amount: Number(form.pending_amount),
        account_id: Number(form.account_id),
      });
      setForm(initialState);
      setShowForm(false);
      fetchIngresos();
    } catch (err: any) {
      setError("Error al crear el ingreso. Revisa todos los campos.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro?")) return;
    try {
      await api.deleteScheduledIncome(id);
      fetchIngresos();
    } catch (err: any) {
      setError("Error al eliminar el ingreso programado");
    }
  };

  const startEdit = (i: IngresoProgramado) => {
    setEditId(i.id);
    setEditForm({
      income_name: i.income_name,
      income_date: new Date(i.income_date).toISOString().split('T')[0],
      description: i.description,
      category: i.category,
      next_income: new Date(i.next_income).toISOString().split('T')[0],
      amount: i.amount,
      received_amount: i.received_amount,
      pending_amount: i.pending_amount,
      account_id: i.account_id,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    try {
      await api.updateScheduledIncome(editId, {
        ...editForm,
        amount: Number(editForm.amount),
        received_amount: Number(editForm.received_amount),
        pending_amount: Number(editForm.pending_amount),
        account_id: Number(editForm.account_id),
      });
      setEditId(null);
      fetchIngresos();
    } catch (err: any) {
      setError("Error al actualizar el ingreso programado");
    }
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Ingresos Programados</p>
        <button
          className="flex w-full md:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Nuevo Ingreso Programado</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-md max-w-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Registrar Nuevo Ingreso Programado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="income_name" value={form.income_name} onChange={handleChange} placeholder="Nombre del ingreso" className="border rounded px-3 py-2" required />
                <input name="category" value={form.category} onChange={handleChange} placeholder="Categoría" className="border rounded px-3 py-2" required />
                <input name="amount" value={form.amount} onChange={handleChange} placeholder="Monto total" type="number" className="border rounded px-3 py-2" required />
                <input name="received_amount" value={form.received_amount} onChange={handleChange} placeholder="Monto recibido" type="number" className="border rounded px-3 py-2" required />
                <input name="pending_amount" value={form.pending_amount} onChange={handleChange} placeholder="Monto pendiente" type="number" className="border rounded px-3 py-2" required />
                <select name="account_id" value={form.account_id} onChange={handleChange} className="border rounded px-3 py-2 bg-white" required>
                  <option value="" disabled>-- Asociar a una cuenta --</option>
                  {availableAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.account_name}</option>
                  ))}
                </select>
                <div>
                  <label className="text-xs text-gray-500">Fecha de Inicio</label>
                  <DatePicker
                      selected={form.income_date ? new Date(form.income_date) : null}
                      onChange={(date) => setForm(prev => ({ ...prev, income_date: date?.toISOString().split('T')[0] || '' }))}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="border rounded px-3 py-2 w-full"
                      locale="es"
                      required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Próximo Ingreso</label>
                  <DatePicker
                      selected={form.next_income ? new Date(form.next_income) : null}
                      onChange={(date) => setForm(prev => ({ ...prev, next_income: date?.toISOString().split('T')[0] || '' }))}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="border rounded px-3 py-2 w-full"
                      locale="es"
                      required
                  />
                </div>
                <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border rounded px-3 py-2 col-span-2" required />
            </div>
            <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-[#00a753] text-white font-bold py-2 rounded hover:bg-[#07882c] flex-1">Guardar</button>
                <button type="button" className="bg-gray-200 text-black font-bold py-2 rounded flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
        </form>
      )}

      {loading && <div className="p-4">Cargando...</div>}
      {error && <div className="p-4 text-red-600 bg-red-100 rounded-md">{error}</div>}

      {!loading && !error && (
        <div className="w-full px-4 py-3">
          {/* VISTA DE TABLA PARA ESCRITORIO */}
          <div className="hidden lg:flex overflow-hidden rounded-xl border border-[#d7e0db] bg-[#f9fbfa]">
            <table className="flex-1 table-auto">
              <thead className="bg-[#f2f4f3]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Próximo Ingreso</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Monto Pendiente</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map(i => (
                  <tr key={i.id} className="border-t border-t-[#d7e0db]">
                    {editId === i.id ? (
                      <td colSpan={4} className="p-2"><p className="text-center text-sm">El formulario de edición completo iría aquí.</p></td>
                    ) : (
                      <>
                        <td className="h-[72px] px-4 py-2 text-[#121714]">{i.income_name}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{formatDate(i.next_income)}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273] font-medium">${i.pending_amount.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2">
                          <button onClick={() => startEdit(i)} className="text-sm text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDelete(i.id)} className="text-sm text-red-600 hover:underline ml-3">Eliminar</button>
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
            {ingresos.map(i => (
              <div key={i.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start">
                    <span className="font-bold text-lg text-[#121714]">{i.income_name}</span>
                    <span className="text-sm text-gray-500">{i.category}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Próximo Ingreso:</span>
                    <span className="text-sm font-medium">{formatDate(i.next_income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto Pendiente:</span>
                    <span className="text-sm font-bold text-blue-600">${i.pending_amount.toLocaleString()}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto Total:</span>
                    <span className="text-sm font-medium">${i.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t flex justify-end gap-4">
                    <button onClick={() => startEdit(i)} className="text-sm text-blue-600 font-medium">Editar</button>
                    <button onClick={() => handleDelete(i.id)} className="text-sm text-red-600 font-medium">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngresosProgramadosPage;
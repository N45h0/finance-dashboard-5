import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";
import { Account } from './CuentasPage';
import { formatDate } from "./utils";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export interface Prestamo {
  id: number;
  loan_name: string;
  holder: string;
  price: number;
  description: string | null;
  date: string;
  quota: number | null;
  tea: number | null;
  remaining_price: number;
  account_id: number;
  expiration_date: string;
}

const initialState = {
    loan_name: '',
    holder: '',
    price: '',
    description: '',
    date: '',
    quota: '',
    tea: '',
    remaining_price: '',
    account_id: '',
    expiration_date: ''
};

export const PrestamosPage: React.FC = () => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [form, setForm] = useState(initialState);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<Prestamo, 'id' | 'user_id'>>({ ...initialState, account_id: 0, price: 0, remaining_price: 0, date: '', expiration_date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);

  const fetchPrestamos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLoans();
      setPrestamos(data);
    } catch (err: any) {
      setError("Error al cargar préstamos");
      console.error(err);
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
        fetchPrestamos();
        fetchAccounts();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_id || !form.date || !form.expiration_date) { 
        setError("Por favor, completa todos los campos requeridos.");
        return;
    }
    setError(null);
    try {
      await api.createLoan({
        ...form,
        price: Number(form.price),
        remaining_price: Number(form.remaining_price),
        account_id: Number(form.account_id),
        quota: form.quota ? Number(form.quota) : null,
        tea: form.tea ? Number(form.tea) : null,
        description: form.description || null,
      });
      setForm(initialState);
      setShowForm(false);
      fetchPrestamos();
    } catch (err: any) {
      setError("Error al crear préstamo. Revisa los campos.");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este préstamo?")) return;
    try {
      await api.deleteLoan(id);
      fetchPrestamos();
    } catch (err: any) {
      setError("Error al eliminar préstamo");
      console.error(err);
    }
  };

  const startEdit = (p: Prestamo) => {
    setEditId(p.id);
    setEditForm({
        loan_name: p.loan_name,
        holder: p.holder,
        price: p.price,
        description: p.description || '',
        date: p.date.split('T')[0],
        quota: p.quota,
        tea: p.tea,
        remaining_price: p.remaining_price,
        account_id: p.account_id,
        expiration_date: p.expiration_date.split('T')[0],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setError(null);
    try {
      await api.updateLoan(editId, {
          ...editForm,
          price: Number(editForm.price),
          remaining_price: Number(editForm.remaining_price),
          account_id: Number(editForm.account_id),
          quota: editForm.quota ? Number(editForm.quota) : undefined,
          tea: editForm.tea ? Number(editForm.tea) : undefined,
      });
      setEditId(null);
      fetchPrestamos();
    } catch (err: any) {
      setError("Error al actualizar préstamo");
      console.error(err);
    }
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Préstamos</p>
        <button
          className="flex w-full md:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Nuevo Préstamo</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-md max-w-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Registrar Nuevo Préstamo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="loan_name" value={form.loan_name} onChange={handleChange} placeholder="Nombre del préstamo" className="border rounded px-3 py-2" required />
                <input name="holder" value={form.holder} onChange={handleChange} placeholder="Titular (Ej: Tu nombre)" className="border rounded px-3 py-2" required />
                <input name="price" value={form.price} onChange={handleChange} placeholder="Monto total" type="number" className="border rounded px-3 py-2" required />
                <input name="remaining_price" value={form.remaining_price} onChange={handleChange} placeholder="Saldo pendiente" type="number" className="border rounded px-3 py-2" required />
                <select name="account_id" value={form.account_id} onChange={handleChange} className="border rounded px-3 py-2 bg-white" required>
                  <option value="" disabled>-- Asociar a una cuenta --</option>
                  {availableAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.account_name}</option>
                  ))}
                </select>
                <div>
                    <label className="text-xs text-gray-500">Fecha del préstamo</label>
                    <DatePicker
                        selected={form.date ? new Date(form.date) : null}
                        onChange={(date) => setForm(prev => ({ ...prev, date: date?.toISOString().split('T')[0] || '' }))}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="dd/mm/yyyy"
                        className="border rounded px-3 py-2 w-full"
                        locale="es"
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">Fecha de vencimiento</label>
                    <DatePicker
                        selected={form.expiration_date ? new Date(form.expiration_date) : null}
                        onChange={(date) => setForm(prev => ({ ...prev, expiration_date: date?.toISOString().split('T')[0] || '' }))}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="dd/mm/yyyy"
                        className="border rounded px-3 py-2 w-full"
                        locale="es"
                        required
                    />
                </div>
                <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción (Opcional)" className="border rounded px-3 py-2 md:col-span-2" />
                <input name="quota" value={form.quota} onChange={handleChange} placeholder="Cantidad de Cuotas (Opcional)" type="number" className="border rounded px-3 py-2" />
                <input name="tea" value={form.tea} onChange={handleChange} placeholder="Tasa de Interés % (Opcional)" type="number" step="0.01" className="border rounded px-3 py-2" />
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
            <table className="flex-1 table-auto" id="prestamos-table">
              <thead className="bg-[#f2f4f3]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Préstamo</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Monto Total</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Saldo Pendiente</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Vencimiento</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map(p => (
                  <tr key={p.id} className="border-t border-t-[#d7e0db]">
                    {editId === p.id ? (
                      <td colSpan={5} className="p-4">
                        <form onSubmit={handleEditSubmit}>
                           <h4 className="font-medium mb-2">Editando: {p.loan_name}</h4>
                           <p className="text-sm text-gray-600 mb-2">El formulario de edición completo debería ir aquí.</p>
                           <button type="submit" className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Guardar Cambios</button>
                           <button type="button" onClick={() => setEditId(null)} className="text-sm bg-gray-300 px-3 py-1 rounded ml-2">Cancelar</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="h-[72px] px-4 py-2 text-[#121714]">
                            <div className="font-medium">{p.loan_name}</div>
                            <div className="text-xs text-gray-500">{p.holder}</div>
                        </td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">${p.price.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273] font-medium">${p.remaining_price.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{formatDate(p.expiration_date)}</td>
                        <td className="h-[72px] px-4 py-2">
                           <button onClick={() => startEdit(p)} className="text-sm text-blue-600 hover:underline">Editar</button>
                           <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 hover:underline ml-3">Eliminar</button>
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
            {prestamos.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                 <div className="flex justify-between items-start">
                  <span className="font-bold text-lg text-[#121714]">{p.loan_name}</span>
                  <span className="text-sm text-gray-500">{p.holder}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto Total:</span>
                    <span className="text-sm font-medium">${p.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Saldo Pendiente:</span>
                    <span className="text-sm font-bold text-red-600">${p.remaining_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vencimiento:</span>
                    <span className="text-sm font-medium">{formatDate(p.expiration_date)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t flex justify-end gap-4">
                    <button onClick={() => startEdit(p)} className="text-sm text-blue-600 font-medium">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 font-medium">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestamosPage;
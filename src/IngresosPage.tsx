import React, { useEffect, useState } from 'react';
import { api } from './api'; // Asumo que api.ts tiene updateIncome y deleteIncome

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

  // Estados para el formulario de creación
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);

  // --- INICIO: Lógica añadida para Edición ---
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ income_name: '', income_date: '', description: '', category: '', amount: 0, account_id: 0 });
  // --- FIN: Lógica añadida para Edición ---

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // --- INICIO: Funciones añadidas para Edición y Eliminación ---

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.valueAsNumber || e.target.value });
  };
  
  const startEdit = (inc: Income) => {
    setEditId(inc.id);
    setEditForm({
      income_name: inc.income_name,
      income_date: new Date(inc.income_date).toISOString().split('T')[0], // Formatear para input date
      description: inc.description,
      category: inc.category,
      amount: inc.amount,
      account_id: inc.account_id,
    });
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

  // --- FIN: Funciones añadidas para Edición y Eliminación ---

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
          <input name="income_date" value={form.income_date} onChange={handleChange} type="date" className="border rounded px-3 py-2" required />
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
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{new Date(inc.income_date).toLocaleDateString()}</td>
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
        </div>
      )}
    </div>
  );
};
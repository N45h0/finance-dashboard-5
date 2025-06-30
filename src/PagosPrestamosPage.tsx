import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";

// 1. Interfaz corregida: 'payment_date' se cambia a 'date' y se añade 'description'.
interface PagoPrestamo {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  loan_id: number;
}

// Estado inicial para los formularios
const initialState = {
    amount: '',
    date: '',
    description: '',
    loan_id: '',
};

const PagosPrestamosPage: React.FC = () => {
  const [pagos, setPagos] = useState<PagoPrestamo[]>([]);
  const [form, setForm] = useState(initialState);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<PagoPrestamo, 'id' | 'user_id'>>({ ...initialState, amount: 0, loan_id: 0 });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { token } = useAuth();

  const fetchPagos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLoanPayments();
      setPagos(data);
    } catch (err: any) {
      setError("Error al cargar pagos de préstamos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPagos();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // 2. Se envía el objeto con los nombres de campo correctos ('date')
      await api.createLoanPayment({
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
        loan_id: Number(form.loan_id),
      });
      setForm(initialState);
      setShowForm(false);
      fetchPagos();
    } catch (err: any) {
      setError("Error al crear pago");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Confirmas la eliminación de este pago?")) return;
    try {
      await api.deleteLoanPayment(id);
      fetchPagos();
    } catch (err: any)      setError("Error al eliminar pago");
    }
  };

  const startEdit = (p: PagoPrestamo) => {
    setEditId(p.id);
    setEditForm({
      amount: p.amount,
      date: new Date(p.date).toISOString().split('T')[0],
      description: p.description || '',
      loan_id: p.loan_id,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    try {
      await api.updateLoanPayment(editId, {
        ...editForm,
        amount: Number(editForm.amount),
        loan_id: Number(editForm.loan_id),
      });
      setEditId(null);
      fetchPagos();
    } catch (err: any) {
      setError("Error al editar pago");
    }
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Pagos de Préstamos</p>
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Registrar Pago</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-md max-w-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Registrar Nuevo Pago de Préstamo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="amount" value={form.amount} onChange={handleChange} placeholder="Monto del pago" type="number" className="border rounded px-3 py-2" required />
                <input name="loan_id" value={form.loan_id} onChange={handleChange} placeholder="ID del préstamo" type="number" className="border rounded px-3 py-2" required />
                <div><label className="text-xs text-gray-500">Fecha del Pago</label><input name="date" value={form.date} onChange={handleChange} type="date" className="border rounded px-3 py-2 w-full" required /></div>
                <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción (Opcional)" className="border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading} className="bg-[#00a753] text-white font-bold py-2 rounded hover:bg-[#07882c] flex-1 disabled:bg-gray-400">Guardar</button>
                <button type="button" className="bg-gray-200 text-black font-bold py-2 rounded flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
        </form>
      )}

      {loading && <div className="p-4">Cargando...</div>}
      {error && <div className="p-4 text-red-600 bg-red-100 rounded-md">{error}</div>}

      {/* 3. Se reemplaza la lista <ul> por una tabla con estilos consistentes */}
      {!loading && !error && (
        <div className="px-4 py-3 @container">
          <div className="flex overflow-hidden rounded-xl border border-[#d7e0db] bg-[#f9fbfa]">
            <table className="flex-1 table-auto">
              <thead className="bg-[#f2f4f3]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Descripción</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Monto</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">ID Préstamo</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id} className="border-t border-t-[#d7e0db]">
                    {editId === p.id ? (
                       <td colSpan={5} className="p-2">
                        <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
                          <input name="description" value={editForm.description || ''} onChange={handleEditChange} className="border rounded px-2 py-1 flex-1" placeholder="Descripción" />
                          <input name="amount" value={editForm.amount} onChange={handleEditChange} type="number" className="border rounded px-2 py-1 w-28" />
                          <input name="date" value={editForm.date} onChange={handleEditChange} type="date" className="border rounded px-2 py-1" />
                          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Guardar</button>
                          <button type="button" onClick={() => setEditId(null)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancelar</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="h-[72px] px-4 py-2 text-[#121714]">{p.description || <span className="text-gray-400">N/A</span>}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273] font-medium">${p.amount.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{p.loan_id}</td>
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
        </div>
      )}
    </div>
  );
};

export default PagosPrestamosPage;
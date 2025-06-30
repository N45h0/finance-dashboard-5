import React, { useEffect, useState } from 'react';
import { api } from './api'; // Asumo que api.ts tiene updateService y deleteService

interface Service {
  id: number;
  service_name: string;
  description: string;
  date: string;
  category: string;
  price: number;
  reamining_price: number;
  account_id: number;
  expiration_date: string;
}

const initialFormState = { service_name: '', description: '', date: '', category: '', price: '', reamining_price: '', account_id: '', expiration_date: '' };

export const ServiciosPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el formulario de creación
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);

  // --- INICIO: Lógica añadida para Edición ---
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<Service, 'id' | 'user_id'>>({ ...initialFormState, price: 0, reamining_price: 0, account_id: 0 });
  // --- FIN: Lógica añadida para Edición ---

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createService({
        ...form,
        price: Number(form.price),
        reamining_price: Number(form.reamining_price),
        account_id: Number(form.account_id),
      });
      setForm(initialFormState);
      setShowForm(false);
      fetchServices();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // --- INICIO: Funciones añadidas para Edición y Eliminación ---

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  
  const startEdit = (s: Service) => {
    setEditId(s.id);
    setEditForm({
      service_name: s.service_name,
      description: s.description,
      date: new Date(s.date).toISOString().split('T')[0],
      category: s.category,
      price: s.price,
      reamining_price: s.reamining_price,
      account_id: s.account_id,
      expiration_date: new Date(s.expiration_date).toISOString().split('T')[0],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await api.updateService(editId, {
        ...editForm,
        price: Number(editForm.price),
        reamining_price: Number(editForm.reamining_price),
        account_id: Number(editForm.account_id),
      });
      setEditId(null);
      fetchServices();
    } catch (err: any) {
      setError("Error al actualizar el servicio");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      try {
        await api.deleteService(id);
        fetchServices();
      } catch (err: any) {
        setError("Error al eliminar el servicio");
      }
    }
  };
  // --- FIN: Funciones añadidas para Edición y Eliminación ---

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Servicios</p>
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Nuevo servicio</span>
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-2 bg-white rounded shadow max-w-md mb-4">
          <input name="service_name" value={form.service_name} onChange={handleChange} placeholder="Nombre del servicio" className="border rounded px-3 py-2" required />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border rounded px-3 py-2" />
          <input name="date" value={form.date} onChange={handleChange} type="date" className="border rounded px-3 py-2" required />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Categoría" className="border rounded px-3 py-2" required />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Monto" type="number" className="border rounded px-3 py-2" required />
          <input name="reamining_price" value={form.reamining_price} onChange={handleChange} placeholder="Saldo pendiente" type="number" className="border rounded px-3 py-2" required />
          <input name="account_id" value={form.account_id} onChange={handleChange} placeholder="ID de cuenta" type="number" className="border rounded px-3 py-2" required />
          <input name="expiration_date" value={form.expiration_date} type="date" className="border rounded px-3 py-2" required />
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
          <div id="servicios-table" className="flex overflow-hidden rounded-xl border border-[#d7e0db] bg-[#f9fbfa]">
            <table className="flex-1">
              <thead>
                <tr className="bg-[#f9fbfa]">
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Monto</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Saldo Pendiente</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Categoría</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Vencimiento</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} className="border-t border-t-[#d7e0db]">
                    { editId === s.id ? (
                      <td colSpan={6} className="p-2">
                        <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
                          <input name="service_name" value={editForm.service_name} onChange={handleEditChange} className="border rounded px-2 py-1 flex-1" />
                          <input name="price" value={editForm.price} onChange={handleEditChange} type="number" className="border rounded px-2 py-1 w-24" />
                          <input name="reamining_price" value={editForm.reamining_price} onChange={handleEditChange} type="number" className="border rounded px-2 py-1 w-28" />
                          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Guardar</button>
                          <button type="button" onClick={() => setEditId(null)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancelar</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="h-[72px] px-4 py-2 text-[#121714]">{s.service_name}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">${s.price.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273] font-medium">${s.reamining_price.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{s.category}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{new Date(s.expiration_date).toLocaleDateString()}</td>
                        <td className="h-[72px] px-4 py-2">
                          <button onClick={() => startEdit(s)} className="text-sm text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDelete(s.id)} className="text-sm text-red-600 hover:underline ml-4">Eliminar</button>
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
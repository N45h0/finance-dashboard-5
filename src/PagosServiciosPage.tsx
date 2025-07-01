import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";
import { Service } from "./ServiciosPage";
import { formatDate } from "./utils";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface PagoServicio {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  service_id: number;
}

const initialState = {
    amount: '',
    date: '',
    description: '',
    service_id: '',
};

export const PagosServiciosPage: React.FC = () => {
  const { token } = useAuth();
  const [pagos, setPagos] = useState<PagoServicio[]>([]);
  const [form, setForm] = useState(initialState);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<PagoServicio, 'id' | 'user_id'>>({ ...initialState, amount: 0, service_id: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const fetchPagos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getServicePayments();
      setPagos(data);
    } catch (err: any) {
      setError("Error al cargar pagos de servicios");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const servicesData = await api.getServices();
      setAvailableServices(servicesData);
      if (servicesData.length > 0) {
        setForm(prev => ({...prev, service_id: servicesData[0].id.toString()}));
      }
    } catch(e) { console.error("Error al cargar los servicios", e); }
  };

  useEffect(() => {
    if (token) {
        fetchPagos();
        fetchServices();
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
    if (!form.service_id || !form.date) { 
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }
    setError(null);
    try {
      await api.createServicePayment({
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
        service_id: Number(form.service_id),
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
      await api.deleteServicePayment(id);
      fetchPagos();
    } catch (err: any) {
      setError("Error al eliminar pago");
    }
  };

  const startEdit = (p: PagoServicio) => {
    setEditId(p.id);
    setEditForm({
      amount: p.amount,
      date: new Date(p.date).toISOString().split('T')[0],
      description: p.description || '',
      service_id: p.service_id,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    try {
      await api.updateServicePayment(editId, {
        ...editForm,
        amount: Number(editForm.amount),
        service_id: Number(editForm.service_id),
      });
      setEditId(null);
      fetchPagos();
    } catch (err: any) {
      setError("Error al editar pago");
    }
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Pagos de Servicios</p>
        <button
          className="flex w-full md:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Registrar Pago</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-md max-w-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Registrar Nuevo Pago de Servicio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="amount" value={form.amount} onChange={handleChange} placeholder="Monto del pago" type="number" className="border rounded px-3 py-2" required />
                <select name="service_id" value={form.service_id} onChange={handleChange} className="border rounded px-3 py-2 bg-white" required>
                  <option value="" disabled>-- Asociar a un servicio --</option>
                  {availableServices.map(service => (
                    <option key={service.id} value={service.id}>{service.service_name}</option>
                  ))}
                </select>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Fecha del Pago</label>
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
                <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción (Opcional)" className="border rounded px-3 py-2 md:col-span-2" />
            </div>
            <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading} className="bg-[#00a753] text-white font-bold py-2 rounded hover:bg-[#07882c] flex-1 disabled:bg-gray-400">Guardar</button>
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
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Descripción</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Monto</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left text-[#121714] text-sm font-medium">ID Servicio</th>
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
                          <DatePicker 
                            selected={editForm.date ? new Date(editForm.date) : null}
                            onChange={(date) => setEditForm(prev => ({...prev, date: date?.toISOString().split('T')[0] || ''}))}
                            className="border rounded px-2 py-1"
                            locale="es"
                            dateFormat="dd/MM/yyyy"
                          />
                          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Guardar</button>
                          <button type="button" onClick={() => setEditId(null)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancelar</button>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="h-[72px] px-4 py-2 text-[#121714]">{p.description || <span className="text-gray-400">N/A</span>}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273] font-medium">${p.amount.toLocaleString()}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{formatDate(p.date)}</td>
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{p.service_id}</td>
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
            {pagos.map((p) => {
              const serviceName = availableServices.find(service => service.id === p.service_id)?.service_name || 'Desconocido';
              return (
                <div key={p.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-lg text-[#121714]">{p.description || 'Pago de Servicio'}</span>
                    <span className="text-lg font-bold text-green-600">${p.amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                      <p><span className="text-gray-600">Fecha:</span> {formatDate(p.date)}</p>
                      <p><span className="text-gray-600">Para Servicio:</span> {serviceName}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t flex justify-end gap-4">
                      <button onClick={() => startEdit(p)} className="text-sm text-blue-600 font-medium">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 font-medium">Eliminar</button>
                  </div>
                </div>
              )}
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosServiciosPage;
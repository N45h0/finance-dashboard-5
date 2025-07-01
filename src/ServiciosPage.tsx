import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Account } from './CuentasPage';
import { formatDate } from './utils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from './useAuth';

export interface Service {
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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<Service, 'id' | 'user_id'>>({ ...initialFormState, price: 0, reamining_price: 0, account_id: 0 });
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const { token } = useAuth();

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
      fetchServices();
      fetchAccounts();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_id || !form.date || !form.expiration_date) {
        setError("Por favor, completa todos los campos requeridos.");
        return;
    }
    setError(null);
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

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#121714] tracking-light text-[32px] font-bold leading-tight min-w-72">Servicios</p>
        <button
          className="flex w-full md:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ebefed] text-[#121714] text-sm font-medium leading-normal"
          onClick={() => setShowForm(true)}
        >
          <span className="truncate">Nuevo servicio</span>
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-md max-w-lg mb-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Registrar Nuevo Servicio</h3>
          <input name="service_name" value={form.service_name} onChange={handleChange} placeholder="Nombre del servicio" className="border rounded px-3 py-2" required />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border rounded px-3 py-2" />
          <DatePicker
            selected={form.date ? new Date(form.date) : null}
            onChange={(date) => setForm(prev => ({ ...prev, date: date?.toISOString().split('T')[0] || '' }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="Fecha del servicio"
            className="border rounded px-3 py-2 w-full"
            locale="es"
            required
          />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Categoría" className="border rounded px-3 py-2" required />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Monto" type="number" className="border rounded px-3 py-2" required />
          <input name="reamining_price" value={form.reamining_price} onChange={handleChange} placeholder="Saldo pendiente" type="number" className="border rounded px-3 py-2" required />
          <select name="account_id" value={form.account_id} onChange={handleChange} className="border rounded px-3 py-2 bg-white" required>
            <option value="" disabled>-- Asociar a una cuenta --</option>
            {availableAccounts.map(account => (<option key={account.id} value={account.id}>{account.account_name}</option>))}
          </select>
          <DatePicker
            selected={form.expiration_date ? new Date(form.expiration_date) : null}
            onChange={(date) => setForm(prev => ({ ...prev, expiration_date: date?.toISOString().split('T')[0] || '' }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="Fecha de vencimiento"
            className="border rounded px-3 py-2 w-full"
            locale="es"
            required
          />       
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-[#00a753] text-white font-bold py-2 rounded hover:bg-[#07882c] flex-1">Guardar</button>
            <button type="button" className="bg-gray-200 text-black font-bold py-2 rounded flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? ( <div className="p-4">Cargando...</div> ) : error ? ( <div className="p-4 text-red-600">{error}</div> ) : (
        <div className="w-full px-4 py-3">
          
          {/* VISTA DE TABLA PARA ESCRITORIO */}
          <div className="hidden lg:flex overflow-hidden rounded-xl border border-[#d7e0db] bg-[#f9fbfa]">
            <table className="flex-1" id="servicios-table">
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
                        <td className="h-[72px] px-4 py-2 text-[#648273]">{formatDate(s.expiration_date)}</td>
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

          {/* VISTA DE TARJETAS PARA MÓVIL */}
          <div className="block lg:hidden space-y-4">
            {services.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg text-[#121714]">{s.service_name}</span>
                  <span className="text-sm text-gray-500">{s.category}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto:</span>
                    <span className="text-sm font-medium">${s.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Saldo Pendiente:</span>
                    <span className="text-sm font-bold text-red-600">${s.reamining_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vencimiento:</span>
                    <span className="text-sm font-medium">{formatDate(s.expiration_date)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t flex justify-end gap-4">
                    <button onClick={() => startEdit(s)} className="text-sm text-blue-600 font-medium">Editar</button>
                    <button onClick={() => handleDelete(s.id)} className="text-sm text-red-600 font-medium">Eliminar</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default ServiciosPage;
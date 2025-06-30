import React, { useEffect, useState } from 'react';
import { api } from './api';

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

export const ServiciosPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ service_name: '', description: '', date: '', category: '', price: '', reamining_price: '', account_id: '', expiration_date: '' });

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
        service_name: form.service_name,
        description: form.description,
        date: form.date,
        category: form.category,
        price: Number(form.price),
        reamining_price: Number(form.reamining_price),
        account_id: Number(form.account_id),
        expiration_date: form.expiration_date,
      });
      setForm({ service_name: '', description: '', date: '', category: '', price: '', reamining_price: '', account_id: '', expiration_date: '' });
      setShowForm(false);
      fetchServices();
    } catch (e: any) {
      setError(e.message);
    }
  };

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
          <input name="date" value={form.date} onChange={handleChange} placeholder="Fecha (YYYY-MM-DD)" className="border rounded px-3 py-2" required />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Categoría" className="border rounded px-3 py-2" required />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Monto" type="number" className="border rounded px-3 py-2" required />
          <input name="reamining_price" value={form.reamining_price} onChange={handleChange} placeholder="Saldo pendiente" type="number" className="border rounded px-3 py-2" required />
          <input name="account_id" value={form.account_id} onChange={handleChange} placeholder="ID de cuenta" type="number" className="border rounded px-3 py-2" required />
          <input name="expiration_date" value={form.expiration_date} onChange={handleChange} placeholder="Fecha de vencimiento (YYYY-MM-DD)" className="border rounded px-3 py-2" required />
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
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Nombre</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Monto</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Saldo pendiente</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Categoría</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Cuenta</th>
                  <th className="px-4 py-3 text-left text-[#121714] w-[400px] text-sm font-medium leading-normal">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} className="border-t border-t-[#d7e0db]">
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#121714] text-sm font-normal leading-normal">{s.service_name}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">${s.price}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">${s.reamining_price}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{s.category}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{s.account_id}</td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#648273] text-sm font-normal leading-normal">{s.expiration_date}</td>
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

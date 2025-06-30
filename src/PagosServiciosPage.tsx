import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";

interface PagoServicio {
  id: number;
  amount: number;
  payment_date: string;
  service_id: number;
}

const PagosServiciosPage: React.FC = () => {
  useAuth(); // Solo para proteger la página
  const [pagos, setPagos] = useState<PagoServicio[]>([]);
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editPaymentDate, setEditPaymentDate] = useState("");
  const [editServiceId, setEditServiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPagos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getServicePayments();
      setPagos(data);
    } catch (err: any) {
      setError("Error al cargar pagos de servicios");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createServicePayment({ amount, payment_date: paymentDate, service_id: Number(serviceId) });
      setAmount(0);
      setPaymentDate("");
      setServiceId("");
      fetchPagos();
    } catch (err: any) {
      setError("Error al crear pago");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      await api.deleteServicePayment(id);
      fetchPagos();
    } catch (err: any) {
      setError("Error al eliminar pago");
    }
    setLoading(false);
  };

  const startEdit = (p: PagoServicio) => {
    setEditId(p.id);
    setEditAmount(p.amount);
    setEditPaymentDate(p.payment_date);
    setEditServiceId(p.service_id.toString());
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setLoading(true);
    setError("");
    try {
      await api.updateServicePayment(editId, { amount: editAmount, payment_date: editPaymentDate, service_id: Number(editServiceId) });
      setEditId(null);
      fetchPagos();
    } catch (err: any) {
      setError("Error al editar pago");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Pagos de Servicios</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          required
        />
        <input
          type="date"
          placeholder="Fecha de pago"
          value={paymentDate}
          onChange={e => setPaymentDate(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="ID del servicio"
          value={serviceId}
          onChange={e => setServiceId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Agregar Pago</button>
      </form>
      <ul>
        {pagos.map((p) => (
          <li key={p.id}>
            {editId === p.id ? (
              <form onSubmit={handleEdit} style={{ display: "inline" }}>
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(Number(e.target.value))}
                  required
                  style={{ width: 80 }}
                />
                <input
                  type="date"
                  value={editPaymentDate}
                  onChange={e => setEditPaymentDate(e.target.value)}
                  required
                  style={{ width: 120 }}
                />
                <input
                  type="number"
                  value={editServiceId}
                  onChange={e => setEditServiceId(e.target.value)}
                  required
                  style={{ width: 80 }}
                />
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
              </form>
            ) : (
              <>
                Pago: ${p.amount} | Fecha: {p.payment_date} | Servicio ID: {p.service_id}
                <button onClick={() => startEdit(p)} style={{ marginLeft: 8 }}>Editar</button>
                <button onClick={() => handleDelete(p.id)} style={{ marginLeft: 4 }}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PagosServiciosPage;

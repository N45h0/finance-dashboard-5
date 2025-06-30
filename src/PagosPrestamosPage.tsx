import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";

interface PagoPrestamo {
  id: number;
  amount: number;
  payment_date: string;
  loan_id: number;
}

const PagosPrestamosPage: React.FC = () => {
  const { token } = useAuth();
  const [pagos, setPagos] = useState<PagoPrestamo[]>([]);
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [loanId, setLoanId] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editPaymentDate, setEditPaymentDate] = useState("");
  const [editLoanId, setEditLoanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPagos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getLoanPayments();
      setPagos(data);
    } catch (err: any) {
      setError("Error al cargar pagos de préstamos");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchPagos();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createLoanPayment({ amount, payment_date: paymentDate, loan_id: Number(loanId) });
      setAmount(0);
      setPaymentDate("");
      setLoanId("");
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
      await api.deleteLoanPayment(id);
      fetchPagos();
    } catch (err: any) {
      setError("Error al eliminar pago");
    }
    setLoading(false);
  };

  const startEdit = (p: PagoPrestamo) => {
    setEditId(p.id);
    setEditAmount(p.amount);
    setEditPaymentDate(p.payment_date);
    setEditLoanId(p.loan_id.toString());
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setLoading(true);
    setError("");
    try {
      await api.updateLoanPayment(editId, { amount: editAmount, payment_date: editPaymentDate, loan_id: Number(editLoanId) });
      setEditId(null);
      fetchPagos();
    } catch (err: any) {
      setError("Error al editar pago");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Pagos de Préstamos</h2>
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
          placeholder="ID del préstamo"
          value={loanId}
          onChange={e => setLoanId(e.target.value)}
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
                  value={editLoanId}
                  onChange={e => setEditLoanId(e.target.value)}
                  required
                  style={{ width: 80 }}
                />
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
              </form>
            ) : (
              <>
                Pago: ${p.amount} | Fecha: {p.payment_date} | Préstamo ID: {p.loan_id}
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

export default PagosPrestamosPage;

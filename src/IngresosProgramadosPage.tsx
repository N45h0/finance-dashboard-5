import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";

interface IngresoProgramado {
  id: number;
  amount: number;
  scheduled_date: string;
  description: string;
  account_id: number;
}

const IngresosProgramadosPage: React.FC = () => {
  useAuth(); // Solo para proteger la página
  const [ingresos, setIngresos] = useState<IngresoProgramado[]>([]);
  const [amount, setAmount] = useState(0);
  const [scheduledDate, setScheduledDate] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editScheduledDate, setEditScheduledDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAccountId, setEditAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchIngresos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getScheduledIncomes();
      setIngresos(data);
    } catch (err: any) {
      setError("Error al cargar ingresos programados");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIngresos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createScheduledIncome({ amount, scheduled_date: scheduledDate, description, account_id: Number(accountId) });
      setAmount(0);
      setScheduledDate("");
      setDescription("");
      setAccountId("");
      fetchIngresos();
    } catch (err: any) {
      setError("Error al crear ingreso programado");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      await api.deleteScheduledIncome(id);
      fetchIngresos();
    } catch (err: any) {
      setError("Error al eliminar ingreso programado");
    }
    setLoading(false);
  };

  const startEdit = (i: IngresoProgramado) => {
    setEditId(i.id);
    setEditAmount(i.amount);
    setEditScheduledDate(i.scheduled_date);
    setEditDescription(i.description);
    setEditAccountId(i.account_id.toString());
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setLoading(true);
    setError("");
    try {
      await api.updateScheduledIncome(editId, { amount: editAmount, scheduled_date: editScheduledDate, description: editDescription, account_id: Number(editAccountId) });
      setEditId(null);
      fetchIngresos();
    } catch (err: any) {
      setError("Error al editar ingreso programado");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Ingresos Programados</h2>
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
          placeholder="Fecha programada"
          value={scheduledDate}
          onChange={e => setScheduledDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="ID de cuenta"
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Agregar Ingreso</button>
      </form>
      <ul>
        {ingresos.map((i) => (
          <li key={i.id}>
            {editId === i.id ? (
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
                  value={editScheduledDate}
                  onChange={e => setEditScheduledDate(e.target.value)}
                  required
                  style={{ width: 120 }}
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  required
                  style={{ width: 120 }}
                />
                <input
                  type="number"
                  value={editAccountId}
                  onChange={e => setEditAccountId(e.target.value)}
                  required
                  style={{ width: 80 }}
                />
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
              </form>
            ) : (
              <>
                Ingreso: ${i.amount} | Fecha: {i.scheduled_date} | Desc: {i.description} | Cuenta ID: {i.account_id}
                <button onClick={() => startEdit(i)} style={{ marginLeft: 8 }}>Editar</button>
                <button onClick={() => handleDelete(i.id)} style={{ marginLeft: 4 }}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngresosProgramadosPage;

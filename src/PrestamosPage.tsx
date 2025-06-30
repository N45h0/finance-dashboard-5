import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./useAuth";

interface Prestamo {
  id: number;
  amount: number;
  description: string;
}

const PrestamosPage: React.FC = () => {
  const { token } = useAuth();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editMonto, setEditMonto] = useState(0);
  const [editDescripcion, setEditDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPrestamos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getLoans();
      setPrestamos(data);
    } catch (err: any) {
      setError("Error al cargar préstamos");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchPrestamos();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createLoan({ amount: monto, description: descripcion });
      setMonto(0);
      setDescripcion("");
      fetchPrestamos();
    } catch (err: any) {
      setError("Error al crear préstamo");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      await api.deleteLoan(id);
      fetchPrestamos();
    } catch (err: any) {
      setError("Error al eliminar préstamo");
    }
    setLoading(false);
  };

  const startEdit = (p: Prestamo) => {
    setEditId(p.id);
    setEditMonto(p.amount);
    setEditDescripcion(p.description);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setLoading(true);
    setError("");
    try {
      await api.updateLoan(editId, { amount: editMonto, description: editDescripcion });
      setEditId(null);
      fetchPrestamos();
    } catch (err: any) {
      setError("Error al editar préstamo");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Préstamos</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={e => setMonto(Number(e.target.value))}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Agregar Préstamo</button>
      </form>
      <ul>
        {prestamos.map((p) => (
          <li key={p.id}>
            {editId === p.id ? (
              <form onSubmit={handleEdit} style={{ display: "inline" }}>
                <input
                  type="number"
                  value={editMonto}
                  onChange={e => setEditMonto(Number(e.target.value))}
                  required
                  style={{ width: 80 }}
                />
                <input
                  type="text"
                  value={editDescripcion}
                  onChange={e => setEditDescripcion(e.target.value)}
                  required
                  style={{ width: 120 }}
                />
                <button type="submit" disabled={loading}>Guardar</button>
                <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
              </form>
            ) : (
              <>
                {p.description} - ${p.amount}
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

export default PrestamosPage;

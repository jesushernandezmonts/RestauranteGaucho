"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

type ChangePasswordModalProps = {
  user: { id: number; nombre: string };
  onClose: () => void;
  onSaved: () => void;
};

export function ChangePasswordModal({ user, onClose, onSaved }: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("La contraseña no puede estar vacía.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/usuarios/${user.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || "Error al cambiar la contraseña.");
      }
    } catch (e) {
      console.error(e);
      setError("Error de conexión al intentar cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">Cambiar Contraseña</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-light"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-text-muted">
          Estás cambiando la contraseña para <span className="font-bold text-text-primary">{user.nombre}</span>.
        </p>
        <input
          type="password"
          placeholder="Nueva Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          required
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium hover:bg-primary/20"
          >
            {saving ? <Loader2 className="animate-spin mx-auto" /> : "Confirmar Cambio"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Users,
  Plus,
  X,
  Pencil,
  UserPlus,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";

type Usuario = {
  id: number;
  nombre: string;
  usuario: string;
  role: string;
  activo: boolean;
  createdAt: string;
};

const roleLabels: Record<string, string> = {
  MESERO: "👨🍳 Mesero",
  CHEF: "👩🍳 Chef",
  ADMIN: "👑 Admin",
};

export default function UsuariosSection() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [changePasswordUser, setChangePasswordUser] = useState<Usuario | null>(null);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      const res = await fetch("/api/usuarios");
      setUsuarios(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/usuarios/${userToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("Error al eliminar usuario", data);
        alert(data?.error ?? "No se pudo eliminar el usuario.");
        return;
      }

      setUserToDelete(null);
      await loadUsuarios();
    } catch (e) {
      console.error("Error de conexión al eliminar", e);
      alert("Error de conexión al eliminar el usuario.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">
              Usuarios
            </h1>
            <p className="text-sm text-text-muted">Gestión de empleados</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary !px-4 !py-2 text-sm"
          >
            <UserPlus size={16} /> Nuevo
          </button>
        </div>

        <div className="card !p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10">
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase">
                  Nombre
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase">
                  Usuario
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase">
                  Rol
                </th>
                <th className="text-center px-6 py-4 text-xs font-medium text-text-muted uppercase">
                  Activo
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-surface-light/30">
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">
                    {u.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {u.usuario}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {roleLabels[u.role] || u.role}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        u.activo ? "bg-success" : "bg-text-muted"
                      }`}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setChangePasswordUser(u)}
                        className="p-1.5 rounded-lg hover:bg-surface-light"
                      >
                        <KeyRound size={14} className="text-text-muted" />
                      </button>
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-1.5 rounded-lg hover:bg-surface-light"
                      >
                        <Pencil size={14} className="text-text-muted" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        className="p-1.5 rounded-lg hover:bg-surface-light"
                        aria-label={`Eliminar a ${u.nombre}`}
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCreate && (
          <UserFormModal
            onClose={() => setShowCreate(false)}
            onSaved={() => {
              setShowCreate(false);
              loadUsuarios();
            }}
          />
        )}
        {editUser && (
          <EditUserModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onSaved={() => {
              setEditUser(null);
              loadUsuarios();
            }}
          />
        )}
        {changePasswordUser && (
          <ChangePasswordModal
            user={changePasswordUser}
            onClose={() => setChangePasswordUser(null)}
            onSaved={() => {
              setChangePasswordUser(null);
            }}
          />
        )}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setUserToDelete(null)} />
            <div
              className="relative w-full max-w-sm rounded-2xl border border-danger/30 bg-surface p-6 shadow-2xl"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-user-title"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger/15">
                <Trash2 size={20} className="text-danger" />
              </div>
              <h2 id="delete-user-title" className="text-lg font-semibold text-text-primary">
                ¿Eliminar usuario?
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Vas a eliminar a <strong>{userToDelete.nombre}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 rounded-xl bg-surface-lighter py-2.5 text-sm text-text-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserFormModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("MESERO");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !usuario || !password) return;
    setSaving(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, usuario, password, role }),
      });
      if (res.ok) onSaved();
    } catch (e) {
      console.error(e);
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
          <h3 className="font-semibold text-text-primary">Nuevo Usuario</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-light"
          >
            <X size={18} />
          </button>
        </div>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          required
        />
        <input
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-4 text-text-muted hover:text-text-primary"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
        >
          <option value="MESERO">👨🍳 Mesero</option>
          <option value="CHEF">👩🍳 Chef</option>
          <option value="ADMIN">👑 Admin</option>
        </select>
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
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: Usuario;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(user.nombre);
  const [role, setRole] = useState(user.role);
  const [activo, setActivo] = useState(user.activo);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, nombre, role, activo }),
      });
      if (res.ok) onSaved();
    } catch (e) {
      console.error(e);
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
          <h3 className="font-semibold text-text-primary">Editar Usuario</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-light"
          >
            <X size={18} />
          </button>
        </div>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm"
        >
          <option value="MESERO">👨🍳 Mesero</option>
          <option value="CHEF">👩🍳 Chef</option>
          <option value="ADMIN">👑 Admin</option>
        </select>
        <label className="flex items-center gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="accent-primary"
          />
          Usuario activo
        </label>
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
            className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium"
          >
            {saving ? "..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

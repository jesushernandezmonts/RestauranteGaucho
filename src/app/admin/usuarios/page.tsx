"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft, Users, Plus, X, Pencil, UserPlus } from "lucide-react";

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

export default function AdminUsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => { loadUsuarios(); }, []);

  async function loadUsuarios() {
    try {
      const res = await fetch("/api/usuarios");
      setUsuarios(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center dark-section"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen dark-section p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-light"><ChevronLeft size={20} /></Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-text-primary">Usuarios</h1>
              <p className="text-sm text-text-muted">Gestión de empleados</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary !px-4 !py-2 text-sm">
            <UserPlus size={16} /> Nuevo
          </button>
        </div>

        <div className="w-full bg-stone-900/60 border border-stone-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/80 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-400 font-mono">
                      @{u.usuario}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {u.role === "ADMIN" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          👑 Admin
                        </span>
                      )}
                      {u.role === "CHEF" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          🍳 Chef
                        </span>
                      )}
                      {u.role === "MESERO" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          🧑‍🍳 Mesero
                        </span>
                      )}
                      {u.role !== "ADMIN" && u.role !== "CHEF" && u.role !== "MESERO" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-800 text-stone-400 border border-stone-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-500" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition shadow-sm"
                          title="Editar Usuario"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreate && <UserFormModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); loadUsuarios(); }} />}
        {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={() => { setEditUser(null); loadUsuarios(); }} />}
      </div>
    </div>
  );
}

function UserFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MESERO");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !usuario || !password) return;
    setSaving(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, usuario, password, role }),
      });
      if (res.ok) onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">Nuevo Usuario</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light"><X size={18} /></button>
        </div>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
        <input placeholder="Usuario" value={usuario} onChange={e => setUsuario(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" required />
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm">
          <option value="MESERO">👨🍳 Mesero</option>
          <option value="CHEF">👩🍳 Chef</option>
          <option value="ADMIN">👑 Admin</option>
        </select>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium hover:bg-primary/20">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: Usuario; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(user.nombre);
  const [role, setRole] = useState(user.role);
  const [activo, setActivo] = useState(user.activo);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, nombre, role, activo }),
      });
      if (res.ok) onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface rounded-2xl border border-primary/10 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">Editar Usuario</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light"><X size={18} /></button>
        </div>
        <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm" />
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary text-sm">
          <option value="MESERO">👨🍳 Mesero</option>
          <option value="CHEF">👩🍳 Chef</option>
          <option value="ADMIN">👑 Admin</option>
        </select>
        <label className="flex items-center gap-3 text-sm text-text-secondary">
          <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="accent-primary" />
          Usuario activo
        </label>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium">{saving ? "..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

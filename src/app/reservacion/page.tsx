"use client";

import { useState } from "react";
import { CalendarDays, Clock, Users, Phone, Mail, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";

export default function ReservacionPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("19:00");
  const [personas, setPersonas] = useState(2);
  const [notas, setNotas] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !fecha || !hora) {
      setError("Completa los campos requeridos");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/reservaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, email, fecha, hora, personas, notas }),
      });
      if (!res.ok) throw new Error("Error");
      setSuccess(true);
    } catch {
      setError("Error al crear la reservación");
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient mb-3">¡Reservación Confirmada!</h1>
          <p className="text-text-secondary mb-2">Hemos recibido tu reservación para <strong>{personas}</strong> {personas === 1 ? "persona" : "personas"}.</p>
          <p className="text-text-muted text-sm">Te contactaremos si es necesario. ¡Gracias por preferir Gaucho! 🥩</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Hero */}
      <div className="relative pt-32 pb-16 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-4">Reservación</h1>
          <p className="text-text-secondary">Reserva tu mesa en Gaucho Restaurante</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 pb-20">
        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"><Users size={16} /> Nombre completo *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30" required />
          </div>
          {/* Contacto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"><Phone size={14} /> Teléfono</label>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+52" className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"><Mail size={14} /> Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30" />
            </div>
          </div>
          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"><CalendarDays size={14} /> Fecha *</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary focus:outline-none focus:border-primary/30 [color-scheme:dark]" required />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"><Clock size={14} /> Hora *</label>
              <select value={hora} onChange={e => setHora(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary focus:outline-none focus:border-primary/30">
                {["13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00"].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Personas */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"><Users size={16} /> Personas *</label>
            <div className="flex gap-2">
              {[1,2,3,4,5,6,8,10].map(n => (
                <button key={n} type="button" onClick={() => setPersonas(n)} className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all ${personas === n ? "bg-primary/10 text-primary-light border-primary/30" : "bg-surface-light text-text-secondary border-primary/10 hover:border-primary/30"}`}>{n}</button>
              ))}
            </div>
          </div>
          {/* Notas */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"><MessageSquare size={16} /> Notas</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Alguna ocasión especial, preferencias..." rows={2} className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 text-sm resize-none" />
          </div>
          {error && <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm">{error}</div>}
          <button type="submit" disabled={sending} className="btn-primary w-full text-base py-3.5 disabled:opacity-50">
            {sending ? <Loader2 size={20} className="animate-spin" /> : <CalendarDays size={20} />}
            {sending ? "Enviando..." : "Reservar"}
          </button>
        </form>
      </div>
    </div>
  );
}

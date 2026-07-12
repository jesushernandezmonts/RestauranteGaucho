"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";

// ── Constantes ──────────────────────────────────────────────────

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

const ANIOS = (() => {
  const y = new Date().getFullYear();
  return [y, y + 1, y + 2];
})();

const WHATSAPP_NUMBER = "5212471209374";

// ── Componente principal ────────────────────────────────────────

export default function ReservacionPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState(2);
  const [notas, setNotas] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Clock state
  const [showClock, setShowClock] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [clockStep, setClockStep] = useState<"hour" | "minute">("hour");
  const clockRef = useRef<HTMLDivElement>(null);

  // ── Efecto para cerrar reloj al hacer clic fuera ──────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (clockRef.current && !clockRef.current.contains(e.target as Node)) {
        setShowClock(false);
      }
    }
    if (showClock) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showClock]);

  // ── Generar fecha string desde dia/mes/año ────────────────────
  const getFechaStr = () => {
    if (!dia || !mes || !anio) return "";
    return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  };

  // ── Formatear fecha para mostrar ──────────────────────────────
  const formatDateDisplay = () => {
    if (!dia || !mes || !anio) return "";
    const date = new Date(Number(anio), Number(mes) - 1, Number(dia));
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ── Validar día según mes ─────────────────────────────────────
  const getMaxDias = () => {
    if (!mes || !anio) return 31;
    return new Date(Number(anio), Number(mes), 0).getDate();
  };

  const maxDias = getMaxDias();
  const diasValidos = DIAS.filter((d) => d <= maxDias);

  // ── Manejar clic en el reloj (horas) ──────────────────────────
  const handleClockHourClick = (hour: number) => {
    const horaRestaurant = hour === 12 ? 12 : hour; // 12 = mediodía
    if (horaRestaurant < 1 || horaRestaurant > 10) return; // solo 13:00-22:00
    setSelectedHour(horaRestaurant);
    setSelectedMinute(0);
    setClockStep("minute");
  };

  // ── Confirmar hora ────────────────────────────────────────────
  const confirmTime = () => {
    if (selectedHour === null) return;
    const h24 = selectedHour + 12; // convertimos a 24h (1PM=13, 10PM=22)
    const minStr = String(selectedMinute).padStart(2, "0");
    setHora(`${h24}:${minStr}`);
    setShowClock(false);
    setClockStep("hour");
    setSelectedHour(null);
  };

  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  // ── Validar teléfono (solo números) ───────────────────────────
  const handleTelefonoChange = (value: string) => {
    if (value === "" || /^[0-9+\s]*$/.test(value)) {
      setTelefono(value);
    }
  };

  // ── Validar formulario con alertas bonitas ────────────────────
  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!nombre.trim()) errors.push("Nombre");
    if (!dia || !mes || !anio) errors.push("Fecha");
    if (!hora) errors.push("Hora");
    if (telefono && !/^[0-9+\s]+$/.test(telefono)) errors.push("El teléfono solo debe contener números");
    return errors;
  };

  // ── Submit ────────────────────────────────────────────────────
  const fecha = getFechaStr();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors([]);
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

      // Abrir WhatsApp automáticamente
      const fechaFormateada = new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const mensaje = encodeURIComponent(
        `NUEVA RESERVACION - Niño Gaucho` +
        `\n------------------------------------` +
        `\n\nCliente: ${nombre}` +
        `\nFecha: ${fechaFormateada}` +
        `\nHora: ${hora} hrs` +
        `\nPersonas: ${personas}` +
        `${telefono ? `\nTelefono: ${telefono}` : ""}` +
        `${email ? `\nEmail: ${email}` : ""}` +
        `${notas ? `\nNotas: ${notas}` : ""}` +
        `\n\n------------------------------------` +
        `\nNiño Gaucho - Huamantla, Tlaxcala`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, "_blank");
    } catch {
      setError("Error al crear la reservación");
    } finally {
      setSending(false);
    }
  };

  // ── Pantalla de éxito ─────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient mb-3">¡Reservación Confirmada!</h1>
          <p className="text-text-secondary mb-2">
            Hemos recibido tu reservación para <strong>{personas}</strong> {personas === 1 ? "persona" : "personas"}.
          </p>
          <p className="text-text-muted text-sm mb-6">
            Se ha abierto WhatsApp con los detalles. Confirma tu reservación enviando el mensaje. ¡Gracias!
          </p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Hero */}
      <div className="relative pt-32 pb-16 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-4">Reservación</h1>
          <p className="text-text-secondary">Reserva tu mesa en Niño Gaucho</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 pb-20">
        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Users size={16} /> Nombre completo *
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <Phone size={14} /> Teléfono
              </label>
              <input
                value={telefono}
                onChange={(e) => handleTelefonoChange(e.target.value)}
                placeholder="+52 247 120 9374"
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Fecha - Día, Mes, Año */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <CalendarDays size={14} /> Fecha *
            </label>

            {fecha && dia && mes && anio && (
              <p className="text-xs text-text-muted mb-2 italic">
                {formatDateDisplay()}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {/* Día */}
              <div className="relative">
                <select
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-primary/30 text-sm"
                  required
                >
                  <option value="">Día</option>
                  {diasValidos.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>

              {/* Mes */}
              <div className="relative">
                <select
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-primary/30 text-sm"
                  required
                >
                  <option value="">Mes</option>
                  {MESES.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>

              {/* Año */}
              <div className="relative">
                <select
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-primary/30 text-sm"
                  required
                >
                  <option value="">Año</option>
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Hora - Reloj Analógico */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Clock size={14} /> Hora *
            </label>
            <div className="relative" ref={clockRef}>
              <button
                type="button"
                onClick={() => {
                  setShowClock(!showClock);
                  if (!showClock) {
                    setClockStep("hour");
                    if (hora) {
                      const [h, m] = hora.split(":").map(Number);
                      setSelectedHour(h - 12);
                      setSelectedMinute(m);
                    } else {
                      setSelectedHour(null);
                      setSelectedMinute(0);
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-left text-text-primary focus:outline-none focus:border-primary/30 flex items-center justify-between gap-2 transition-all"
              >
                <span className={hora ? "text-text-primary" : "text-text-muted"}>
                  {hora || "Seleccionar hora"}
                </span>
                <Clock size={18} className="text-primary shrink-0" />
              </button>

              {showClock && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-surface border border-primary/10 rounded-2xl p-5 shadow-xl animate-slide-up">
                  {clockStep === "hour" ? (
                    <>
                      <p className="text-center text-xs font-medium text-text-muted mb-3">
                        Selecciona la hora
                      </p>
                      <div className="relative w-56 h-56">
                        {/* Clock face */}
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Outer ring */}
                          <circle
                            cx="100" cy="100" r="92"
                            fill="none"
                            stroke="currentColor"
                            className="text-primary/20"
                            strokeWidth="2"
                          />
                          <circle
                            cx="100" cy="100" r="88"
                            fill="none"
                            stroke="currentColor"
                            className="text-primary/10"
                            strokeWidth="1"
                          />

                          {/* Center dot */}
                          <circle cx="100" cy="100" r="4" className="fill-primary" />

                          {/* Hour ticks & numbers */}
                          {Array.from({ length: 12 }).map((_, i) => {
                            const hour = i === 0 ? 12 : i;
                            const angle = ((i) / 12) * 2 * Math.PI - Math.PI / 2;
                            const outerR = 82;
                            const innerR = 76;
                            const numR = 62;
                            const ox = 100 + outerR * Math.cos(angle);
                            const oy = 100 + outerR * Math.sin(angle);
                            const ix = 100 + innerR * Math.cos(angle);
                            const iy = 100 + innerR * Math.sin(angle);
                            const nx = 100 + numR * Math.cos(angle);
                            const ny = 100 + numR * Math.sin(angle);

                            const isSelectable = hour >= 1 && hour <= 10;
                            const isActive = selectedHour === hour;

                            return (
                              <g key={i}>
                                <line
                                  x1={ix} y1={iy} x2={ox} y2={oy}
                                  stroke={isActive ? "#E8AB2F" : "currentColor"}
                                  strokeWidth={isActive ? 3 : 1.5}
                                  className={isActive ? "" : "text-text-muted"}
                                />
                                {isSelectable && (
                                  <>
                                    <text
                                      x={nx}
                                      y={ny}
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      className={`cursor-pointer select-none text-[13px] font-bold transition-all ${
                                        isActive ? "fill-primary" : "fill-text-secondary hover:fill-primary"
                                      }`}
                                      onClick={() => handleClockHourClick(hour)}
                                    >
                                      {hour}
                                    </text>
                                    {/* Invisible wider click area */}
                                    <circle
                                      cx={nx} cy={ny} r="14"
                                      fill="transparent"
                                      className="cursor-pointer"
                                      onClick={() => handleClockHourClick(hour)}
                                    />
                                  </>
                                )}
                              </g>
                            );
                          })}

                          {/* Hour hand */}
                          {selectedHour !== null && (
                            <line
                              x1="100" y1="100"
                              x2={100 + 45 * Math.cos(((selectedHour % 12) / 12) * 2 * Math.PI - Math.PI / 2)}
                              y2={100 + 45 * Math.sin(((selectedHour % 12) / 12) * 2 * Math.PI - Math.PI / 2)}
                              stroke="#E8AB2F"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          )}

                        </svg>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-center text-xs font-medium text-text-muted mb-3">
                        {selectedHour !== null && `Selecciona los minutos — ${selectedHour}:00`}
                      </p>
                      <div className="relative w-56 h-56">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Rings */}
                          <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" className="text-primary/20" strokeWidth="2" />
                          <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" className="text-primary/10" strokeWidth="1" />
                          <circle cx="100" cy="100" r="4" className="fill-primary" />

                          {/* Minute marks (every 5 minutes) */}
                          {Array.from({ length: 12 }).map((_, i) => {
                            const min = i * 5;
                            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                            const outerR = 82;
                            const innerR = selectedMinute === min ? 68 : 74;
                            const numR = 58;
                            const ox = 100 + outerR * Math.cos(angle);
                            const oy = 100 + outerR * Math.sin(angle);
                            const ix = 100 + innerR * Math.cos(angle);
                            const iy = 100 + innerR * Math.sin(angle);
                            const nx = 100 + numR * Math.cos(angle);
                            const ny = 100 + numR * Math.sin(angle);
                            const isActive = selectedMinute === min;

                            return (
                              <g key={i}>
                                <line
                                  x1={ix} y1={iy} x2={ox} y2={oy}
                                  stroke={isActive ? "#E8AB2F" : "currentColor"}
                                  strokeWidth={isActive ? 3 : 1.5}
                                  className={isActive ? "" : "text-text-muted"}
                                />
                                <text
                                  x={nx}
                                  y={ny}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  className={`cursor-pointer select-none text-[11px] font-semibold transition-all ${
                                    isActive ? "fill-primary" : "fill-text-secondary hover:fill-primary"
                                  }`}
                                  onClick={() => setSelectedMinute(min)}
                                >
                                  {String(min).padStart(2, "0")}
                                </text>
                                <circle
                                  cx={nx} cy={ny} r="14"
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onClick={() => setSelectedMinute(min)}
                                />
                              </g>
                            );
                          })}

                          {/* Minute hand */}
                          <line
                            x1="100" y1="100"
                            x2={100 + 55 * Math.cos(((selectedMinute / 60) * 2 * Math.PI) - Math.PI / 2)}
                            y2={100 + 55 * Math.sin(((selectedMinute / 60) * 2 * Math.PI) - Math.PI / 2)}
                            stroke="#E8AB2F"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </>
                  )}

                  {/* Bottom actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/10">
                    {clockStep === "minute" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setClockStep("hour")}
                          className="text-xs text-text-muted hover:text-text-primary transition-all flex items-center gap-1"
                        >
                          ← Atrás
                        </button>
                        <div className="text-sm font-bold text-primary">
                          {selectedHour !== null && `${selectedHour}:${String(selectedMinute).padStart(2, "0")} PM`}
                        </div>
                        <button
                          type="button"
                          onClick={confirmTime}
                          className="text-xs font-semibold bg-primary text-chocolate px-4 py-1.5 rounded-lg hover:bg-gold-light transition-all"
                        >
                          OK ✓
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center">
                        {selectedHour !== null && (
                          <button
                            type="button"
                            onClick={() => setClockStep("minute")}
                            className="text-xs font-medium bg-primary/10 text-primary-light px-4 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
                          >
                            Siguiente: Minutos →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personas */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Users size={16} /> Personas *
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPersonas(n)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all ${
                    personas === n
                      ? "bg-primary/10 text-primary-light border-primary/30 shadow-sm"
                      : "bg-surface-light text-text-secondary border-primary/10 hover:border-primary/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <MessageSquare size={16} /> Notas <span className="text-text-muted font-normal">(Opcional)</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Alguna ocasión especial, preferencias..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-surface-light border border-primary/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/30 text-sm resize-none transition-all"
            />
          </div>

          {fieldErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 animate-shake">
              <p className="text-amber-400 text-sm font-semibold mb-2">
                ⚠️ Completa los siguientes campos:
              </p>
              <ul className="space-y-1">
                {fieldErrors.map((err, i) => (
                  <li key={i} className="text-amber-300/80 text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400 inline-block" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

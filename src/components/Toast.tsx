"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";

// ─── Tipos ───────────────────────────────────
type ToastType = "success" | "info" | "warning";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  icon?: string;
};

type ToastProps = {
  toast: Toast;
  onDismiss: (id: string) => void;
};

// ─── Colores ─────────────────────────────────
const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "bg-[#054D44]",
    border: "border-[#075E54]",
    icon: "text-[#25D366]",
  },
  info: {
    bg: "bg-[#1C2B3A]",
    border: "border-[#2C3E50]",
    icon: "text-[#3498DB]",
  },
  warning: {
    bg: "bg-[#4A2C0A]",
    border: "border-[#5C3A10]",
    icon: "text-[#F39C12]",
  },
};

// ─── Single Toast ────────────────────────────
function SingleToast({ toast, onDismiss }: ToastProps) {
  const { bg, border, icon } = colors[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-2xl
        min-w-[300px] max-w-[380px] backdrop-blur-xl
        animate-slide-up ${bg} ${border}
      `}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Avatar / Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${icon}`}
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        {toast.icon || "🍳"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">
            {toast.title}
          </span>
          <span className="text-[11px] text-[#8696A0] flex-shrink-0">ahora</span>
        </div>
        <p className="text-sm text-[#D1D7DB] mt-0.5 leading-tight">
          {toast.message}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 mt-0.5"
      >
        <X size={14} className="text-[#8696A0]" />
      </button>
    </div>
  );
}

// ─── Container ───────────────────────────────
type ToastContainerProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// ─── Hook ────────────────────────────────────
let toastCounter = 0;

export function useToasts(autoDismissMs = 5000) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastCounter}`;
      const newToast: Toast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => dismiss(id), autoDismissMs);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss, autoDismissMs]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return { toasts, addToast, dismiss };
}

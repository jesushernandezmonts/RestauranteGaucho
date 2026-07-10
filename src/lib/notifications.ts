"use client";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Reproduce un sonido de notificación tipo "ding" sin necesidad de archivos.
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();


    // Primer tono (A5 – agradable)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 880;
    osc1.type = "sine";
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Segundo tono (E6 – armónico más agudo)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1320;
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.45);
  } catch {
    // Silently fail – no crítico
  }
}

/**
 * Muestra una notificación del sistema.
 * @returns true si se mostró, false si no hay permiso / no soportado.
 */
export async function showNotification(
  title: string,
  body: string
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
    return true;
  }

  if (Notification.permission === "denied") return false;

  // Aún no preguntado – pedir permiso
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
    return true;
  }

  return false;
}

/**
 * Pide permiso para notificaciones (ideal llamarlo tras un click).
 */
export async function requestNotifyPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

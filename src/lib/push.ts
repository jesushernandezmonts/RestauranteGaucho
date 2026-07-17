import { prisma } from "@/lib/prisma";
import webpush from "web-push";

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
};

/**
 * Initialize web-push lazily (only at runtime, never at build time).
 */
function ensureVapid() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BE8auyzwTIMceUmL9eP7T3QiLTb1bl0YK1BY0zmF87_FuyW0C0Kz9pq2U_u-Ez9CbHTRJU0oHsgQuDeaYbk864M";
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!privateKey) {
    console.warn("⚠️ VAPID_PRIVATE_KEY no configurada en Vercel — push desactivadas");
    return false;
  }
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@gaucho.com",
      publicKey,
      privateKey
    );
    return true;
  } catch (e) {
    console.error("❌ Error inicializando VAPID:", e);
    return false;
  }
}

/**
 * Send push notifications to a filtered list of subscriptions.
 * Handles cleanup of expired subscriptions automatically.
 */
async function sendPushToSubscriptions(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload
) {
  if (subscriptions.length === 0) return { success: true, sent: 0, failed: 0 };

  const results = await Promise.allSettled(
    subscriptions.map((sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      return webpush.sendNotification(
        pushSub,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/favicon.ico",
          tag: payload.tag || "gaucho",
          data: {
            url: payload.url || "/",
          },
        })
      );
    })
  );

  let removed = 0;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected") {
      const err = result.reason;
      console.log(`❌ Push falló para suscripción #${i}:`, err?.statusCode, err?.message);
      if (
        err?.statusCode === 410 ||
        err?.statusCode === 404 ||
        err?.message?.includes("expired")
      ) {
        await prisma.pushSubscription.deleteMany({
          where: { endpoint: subscriptions[i].endpoint },
        });
        removed++;
      }
    }
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  console.log(`📨 Push enviadas: ${sent} exitosas, ${results.length - sent} fallaron, ${removed} eliminadas`);

  return {
    success: sent > 0,
    sent,
    failed: results.length - sent,
  };
}

/**
 * Send a push notification only to devices with a specific role (CHEF or MESERO).
 */
export async function sendPushToRole(
  role: "MESERO" | "CHEF",
  payload: PushPayload
) {
  try {
    const ok = ensureVapid();
    if (!ok) return { success: false, sent: 0, failed: 0 };

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { role },
    });
    console.log(`📋 Push [${role}]: ${subscriptions.length} suscripciones encontradas`);

    return sendPushToSubscriptions(subscriptions, payload);
  } catch (error) {
    console.error(`❌ Error en sendPushToRole(${role}):`, error);
    return { success: false, sent: 0, failed: 0 };
  }
}

/**
 * Send a push notification to ALL subscribed devices (regardless of role).
 * Kept for backward compatibility or broadcasts.
 */
export async function sendPushToAll(payload: PushPayload) {
  try {
    const ok = ensureVapid();
    if (!ok) return { success: false, sent: 0, failed: 0 };

    const subscriptions = await prisma.pushSubscription.findMany();
    console.log(`📋 Push [ALL]: ${subscriptions.length} suscripciones encontradas`);

    return sendPushToSubscriptions(subscriptions, payload);
  } catch (error) {
    console.error("❌ Error en sendPushToAll:", error);
    return { success: false, sent: 0, failed: 0 };
  }
}

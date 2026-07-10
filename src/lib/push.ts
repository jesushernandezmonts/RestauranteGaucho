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
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured — push notifications disabled");
    return false;
  }
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@gaucho.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Send a push notification to all subscribed devices.
 */
export async function sendPushToAll(payload: PushPayload) {
  try {
    const ok = ensureVapid();
    if (!ok) return { success: false, sent: 0, failed: 0 };

    const subscriptions = await prisma.pushSubscription.findMany();
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

    // Remove invalid subscriptions
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        const err = result.reason;
        if (
          err?.statusCode === 410 ||
          err?.statusCode === 404 ||
          err?.message?.includes("expired")
        ) {
          await prisma.pushSubscription.deleteMany({
            where: { endpoint: subscriptions[i].endpoint },
          });
        }
      }
    }

    return {
      success: true,
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return { success: false, sent: 0, failed: 0 };
  }
}

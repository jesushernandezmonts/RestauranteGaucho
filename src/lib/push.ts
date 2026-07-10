import { prisma } from "@/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@gaucho.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
};

/**
 * Send a push notification to all subscribed devices.
 */
export async function sendPushToAll(payload: PushPayload) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();

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
        // If subscription is expired/invalid, delete it
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

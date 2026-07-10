import { fetchClient } from "./fetchClient";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    // Get existing subscription
    let subscription = await registration.pushManager.getSubscription();

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("VAPID public key not set in environment.");
      return;
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // Send push token credentials to backend
    await fetchClient.post("/notifications/push-permission", { subscription });
    console.log("Web Push subscription registered successfully with backend.");
  } catch (error) {
    console.error("Failed to register Web Push subscription:", error);
  }
}
export async function unsubscribeFromPushNotifications() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      // First, remove it from the backend DB
      try {
        await fetchClient.delete("/notifications/push-permission", {
          data: { endpoint: subscription.endpoint }
        });
      } catch (err) {
        console.error("Failed to delete push subscription from backend:", err);
      }
      
      // Then unsubscribe locally
      await subscription.unsubscribe();
      console.log("Unsubscribed from push notifications successfully.");
    }
  } catch (err) {
    console.error("Error unsubscribing from push notifications:", err);
  }
}

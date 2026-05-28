const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

/* TODO(WP #8028): the backend endpoints below are assumed and not yet implemented.
 * Confirm paths and payload shapes with the backend team when WP #8028
 * (Front-End Back-End Push Notifications) lands and adjust if needed. */
const SUBSCRIBE_PATH = "/api/v1/notifications/subscribe";
const STATUS_PATH = "/api/v1/notifications/subscription";

const handleResponse = async (response: Response): Promise<void> => {
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
};

export type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const toStored = (sub: PushSubscription): StoredSubscription => {
  const json = sub.toJSON();
  return {
    endpoint: json.endpoint ?? sub.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
  };
};

export const sendSubscription = async (sub: PushSubscription): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}${SUBSCRIBE_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toStored(sub)),
      credentials: "include",
    });
    await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const removeSubscription = async (endpoint: string): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}${SUBSCRIBE_PATH}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
      credentials: "include",
    });
    await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const getServerSubscriptionStatus = async (): Promise<{ subscribed: boolean }> => {
  try {
    const response = await fetch(`${apiUrl}${STATUS_PATH}`, {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 404) return { subscribed: false };
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

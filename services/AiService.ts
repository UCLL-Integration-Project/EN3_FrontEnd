import type { UserAIContext } from "@types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

const handleResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    let code = "UNKNOWN_ERROR";
    try {
      const body = await response.json();
      if (body?.errors?.[0]?.code) code = body.errors[0].code;
    } catch {
      // non-JSON body — keep UNKNOWN_ERROR
    }
    throw new Error(code);
  }
};

export const chatRequest = async (
  question: string,
  context: UserAIContext,
): Promise<{ answer: string }> => {
  try {
    const response = await fetch(`${apiUrl}/api/v1/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question, context }),
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const insightRequest = async (): Promise<{ insight: string | null }> => {
  try {
    const response = await fetch(`${apiUrl}/api/v1/ai/insight`, {
      method: "GET",
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

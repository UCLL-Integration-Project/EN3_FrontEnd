const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const handleResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    try {
      const body = await response.json();

      if (body?.errors?.length) {
        throw new Error(body.errors[0].code);
      }

      throw new Error("UNKNOWN_ERROR");
    } catch (err) {
      if (err instanceof Error && err.message !== "UNKNOWN_ERROR") {
        throw err;
      }

      throw new Error("UNKNOWN_ERROR");
    }
  }
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(`${apiUrl}/api/v1${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    await handleResponse(response);

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("NETWORK_ERROR");
    }

    throw err;
  }
}

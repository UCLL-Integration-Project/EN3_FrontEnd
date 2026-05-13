import { AuthenticationRequest, User } from "@types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

const handleResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    try {
      const body = await response.json();
      const code = body?.errors?.[0]?.code ?? "UNKNOWN_ERROR";
      throw new Error(code);
    } catch (err) {
      if (err instanceof Error && err.message !== "UNKNOWN_ERROR") throw err;
      throw new Error("UNKNOWN_ERROR");
    }
  }
};

export const signupRequest = async (userInput: User): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userInput),
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const loginRequest = async (authRequest: AuthenticationRequest): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authRequest),
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    // fetch() itself throws a TypeError on network failure
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const logoutRequest = async (): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/logout`, {
      method: "POST",
      credentials: "include",
    });
    await handleResponse(response);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "network");
  }
};

export const getUserData = async (username: string): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/${username}`, {
      method: "GET",
      credentials: "include",
    });

    await handleResponse(response);
    return response.json();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "network");
  }
};

export const changeHeightRequest = async (newValue: number): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/height`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newValue),
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const changeWeightRequest = async (newValue: number): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/weight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newValue),
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

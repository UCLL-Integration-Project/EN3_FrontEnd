import { AuthenticationRequest, UpdateProfileInput, User, UserResponse, UserStats } from "@types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

const handleResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    try {
      const body = await response.json();

      if (body?.errors && Array.isArray(body.errors)) {
        const specificError = body.errors.find((e: any) => e.code === "EMAIL_TAKEN");
        const code = specificError ? specificError.code : (body.errors[0]?.code ?? "UNKNOWN_ERROR");
        throw new Error(code);
      }

      throw new Error("UNKNOWN_ERROR");
    } catch (err) {
      if (err instanceof Error && err.message !== "UNKNOWN_ERROR") throw err;
      throw new Error("UNKNOWN_ERROR");
    }
  }
};

/* ==========================================================================
   1. AUTHENTICATION DOMAIN (/api/auth)
   ========================================================================== */

export const signupRequest = async (userInput: User): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/signup`, {
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
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authRequest),
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const verifyMfaRequest = async (username: string, code: string): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, code }),
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const logoutRequest = async (): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    await handleResponse(response);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "network");
  }
};

export const getMyProfileRequest = async (): Promise<UserResponse> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/me`, {
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

export const updateProfileRequest = async (input: UpdateProfileInput): Promise<UserResponse> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

/* ==========================================================================
   3. PASSWORD / ACCOUNT DOMAIN (/api/account)
   ========================================================================== */

export const changePasswordRequest = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/api/account/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: "include",
    });
    await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

/* ==========================================================================
   4. CONNECTIONS DOMAIN (/api/connections)
   ========================================================================== */

export const getConnectionsRequest = async (): Promise<UserResponse[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/connections`, {
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

export const addConnectionRequest = async (username: string): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/api/connections/${encodeURIComponent(username)}`, {
      method: "POST",
      credentials: "include",
    });
    await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const removeConnectionRequest = async (username: string): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/api/connections/${encodeURIComponent(username)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

// Aliased helper if you are migrating old connectRequest() invocations to the new flatter design
export const connectRequest = addConnectionRequest;

/* ==========================================================================
   5. USER QUERIES DOMAIN (/api/users)
   ========================================================================== */

export const getUserData = async (username: string): Promise<User> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/${encodeURIComponent(username)}`, {
      method: "GET",
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "network");
  }
};

export const getActivityRequest = async (username: string): Promise<any[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/${encodeURIComponent(username)}/activity`, {
      method: "GET",
      credentials: "include",
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    return [];
  }
};

/* ==========================================================================
   MISC PROFILES EXTENSIONS (Legacy tracking endpoints)
   ========================================================================== */

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

export const getStatsRequest = async (): Promise<UserStats | null> => {
  try {
    const response = await fetch(`${apiUrl}/api/users/me/stats`, {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 204) return null;
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

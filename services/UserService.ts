import { Activity, AuthenticationRequest, PrivacyInput, UpdateProfileInput, User, UserResponse, UserStats, ConnectionDTO, ConnectionLevel } from "@types";
import { apiFetch } from "./api-client";

/* ==========================================================================
   1. AUTHENTICATION DOMAIN (/api/v1/auth)
   ========================================================================== */

export const signupRequest = async (userInput: User): Promise<User> => {
  return apiFetch<User>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userInput),
  });
};

export const loginRequest = async (authRequest: AuthenticationRequest): Promise<User> => {
  return apiFetch<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(authRequest),
  });
};

export const verifyMfaRequest = async (username: string, code: string): Promise<User> => {
  return apiFetch<User>("/mfa/verify", {
    method: "POST",
    body: JSON.stringify({ username, code }),
  });
};

export const logoutRequest = async (): Promise<void> => {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
};

/* ==========================================================================
   2. PROFILE DOMAIN (/api/v1/users/me)
   ========================================================================== */

export const getMyProfileRequest = async (): Promise<UserResponse> => {
  return apiFetch<UserResponse>("/users/me", {
    method: "GET",
  });
};

export const updateProfileRequest = async (input: UpdateProfileInput): Promise<UserResponse> => {
  return apiFetch<UserResponse>("/users/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
};

export const updatePrivacyRequest = async (input: PrivacyInput): Promise<UserResponse> => {
  return apiFetch<UserResponse>("/users/me/privacy", {
    method: "PUT",
    body: JSON.stringify(input),
  });
};

export const getStatsRequest = async (): Promise<UserStats | null> => {
  try {
    return await apiFetch<UserStats>("/users/me/stats", {
      method: "GET",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNKNOWN_ERROR") {
      return null;
    }
    throw err;
  }
};

/* ==========================================================================
   3. PASSWORD / ACCOUNT DOMAIN (/api/v1/account)
   ========================================================================== */

export const changePasswordRequest = async (currentPassword: string, newPassword: string): Promise<void> => {
  return apiFetch<void>("/account/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

/* ==========================================================================
   4. CONNECTIONS DOMAIN (/api/v1/connections)
   ========================================================================== */

export const getConnectionsRequest = async (): Promise<ConnectionDTO[]> => {
  return apiFetch<ConnectionDTO[]>("/connections", {
    method: "GET",
  });
};

export const addConnectionRequest = async (username: string): Promise<void> => {
  return apiFetch<void>(`/connections/${encodeURIComponent(username)}`, {
    method: "POST",
  });
};

export const removeConnectionRequest = async (username: string): Promise<void> => {
  return apiFetch<void>(`/connections/${encodeURIComponent(username)}`, {
    method: "DELETE",
  });
};

export const setConnectionLevelRequest = async (username: string, level: ConnectionLevel): Promise<void> => {
  return apiFetch<void>(`/connections/${encodeURIComponent(username)}/level`, {
    method: "PUT",
    body: JSON.stringify({ level }),
  });
};

// Aliased helper if you are migrating old connectRequest() invocations to the new flatter design
export const connectRequest = addConnectionRequest;

/* ==========================================================================
   5. USER QUERIES DOMAIN (/api/v1/users)
   ========================================================================== */

export const getUserData = async (username: string): Promise<User> => {
  return apiFetch<User>(`/users/${encodeURIComponent(username)}`, {
    method: "GET",
  });
};

export const getActivityRequest = async (username: string): Promise<Activity[]> => {
  try {
    return await apiFetch<Activity[]>(`/users/${encodeURIComponent(username)}/activity`, {
      method: "GET",
    });
  } catch (err) {
    return [];
  }
};

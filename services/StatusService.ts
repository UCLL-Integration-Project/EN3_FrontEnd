import { StatusRequest, StatusResponse } from "@types";

import { apiFetch } from "./api-client";

class StatusService {
  async createStatus(payload: StatusRequest): Promise<StatusResponse> {
    return apiFetch<StatusResponse>("/status", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getAllStatuses(): Promise<StatusResponse[]> {
    try {
      return await apiFetch<StatusResponse[]>("/status", {
        method: "GET",
      });
    } catch (err) {
      // Catch the semantic 404 error thrown when a user has no status history
      if (err instanceof Error && err.message === "USER_HAS_NO_STATUSES") {
        return []; // Return a clean empty array to the UI component
      }
      // Re-throw any actual layout/network/auth errors
      throw err;
    }
  }

  async getStatusById(id: number): Promise<StatusResponse> {
    return apiFetch<StatusResponse>(`/status/${id}`, {
      method: "GET",
    });
  }
  
  async updateStatus(
      id: number,
      payload: StatusRequest,
    ): Promise<StatusResponse> {
      return apiFetch<StatusResponse>(`/status/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

  async deleteStatus(id: number): Promise<void> {
    await apiFetch<void>(`/status/${id}`, {
      method: "DELETE",
    });
  }
}

const statusService = new StatusService();

export default statusService;

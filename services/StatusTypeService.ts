import { StatusTypeRequest, StatusTypeResponse } from "@types";

import { apiFetch } from "./api-client";

class StatusTypeService {
  async getStatusTypes(): Promise<StatusTypeResponse[]> {
    return apiFetch<StatusTypeResponse[]>("/status/type", {
      method: "GET",
    });
  }

  async getStatusTypeById(id: number): Promise<StatusTypeResponse> {
    return apiFetch<StatusTypeResponse>(`/status/type/${id}`, {
      method: "GET",
    });
  }

  async createStatusType(
    payload: StatusTypeRequest,
  ): Promise<StatusTypeResponse> {
    return apiFetch<StatusTypeResponse>("/status/type", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateStatusType(
    id: number,
    payload: StatusTypeRequest,
  ): Promise<StatusTypeResponse> {
    return apiFetch<StatusTypeResponse>(`/status/type/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteStatusType(id: number): Promise<void> {
    await apiFetch<void>(`/status/type/${id}`, {
      method: "DELETE",
    });
  }
}

const statusTypeService = new StatusTypeService();

export default statusTypeService;

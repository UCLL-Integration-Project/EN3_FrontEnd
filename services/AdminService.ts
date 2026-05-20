import { AdminMemberSummary, Page, Status } from "@types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

const handleResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    try {
      const body = await response.json();
      if (body?.errors && Array.isArray(body.errors)) {
        const code = body.errors[0]?.code ?? "UNKNOWN_ERROR";
        throw new Error(code);
      }
      throw new Error("UNKNOWN_ERROR");
    } catch (err) {
      if (err instanceof Error && err.message !== "UNKNOWN_ERROR") throw err;
      throw new Error("UNKNOWN_ERROR");
    }
  }
};

export type ListMembersParams = {
  search?: string;
  status?: Status | "ALL";
  page?: number;
  size?: number;
};

export const listMembersRequest = async (
  params: ListMembersParams = {},
): Promise<Page<AdminMemberSummary>> => {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status && params.status !== "ALL") qs.set("status", params.status);
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.size !== undefined) qs.set("size", String(params.size));

  try {
    const response = await fetch(`${apiUrl}/api/admin/members?${qs.toString()}`, {
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

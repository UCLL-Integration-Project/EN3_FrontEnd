import { AdminMemberDetail, AdminMemberSummary, Page, Status } from "@types";

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
    const response = await fetch(`${apiUrl}/api/v1/admin/members?${qs.toString()}`, {
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

export const getMemberRequest = async (id: number): Promise<AdminMemberDetail> => {
  try {
    const response = await fetch(`${apiUrl}/api/v1/admin/members/${id}`, {
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

/* The four moderation actions (#9529). Each POSTs an optional note and
   returns the refreshed member detail (status + new audit entry). */
const moderationActionRequest = async (
  id: number,
  action: "suspend" | "reactivate" | "clear-bio" | "clear-avatar" | "flag",
  note?: string,
): Promise<AdminMemberDetail> => {
  try {
    const response = await fetch(`${apiUrl}/api/v1/admin/members/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ note: note ?? null }),
    });
    await handleResponse(response);
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }
};

export const suspendMemberRequest = (id: number, note?: string) =>
  moderationActionRequest(id, "suspend", note);

export const reactivateMemberRequest = (id: number, note?: string) =>
  moderationActionRequest(id, "reactivate", note);

export const clearBioRequest = (id: number, note?: string) =>
  moderationActionRequest(id, "clear-bio", note);

export const clearAvatarRequest = (id: number, note?: string) =>
  moderationActionRequest(id, "clear-avatar", note);

export const flagMemberRequest = (id: number, note?: string) =>
  moderationActionRequest(id, "flag", note);

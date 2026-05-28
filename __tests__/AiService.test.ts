import { chatRequest, insightRequest } from "@services/AiService";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

describe("chatRequest", () => {
  it("returns answer on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ answer: "You have 5 connections." }),
    });
    const result = await chatRequest("How many connections do I have?", {});
    expect(result).toEqual({ answer: "You have 5 connections." });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/ai/chat"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("throws NETWORK_ERROR on TypeError", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(chatRequest("hi", {})).rejects.toThrow("NETWORK_ERROR");
  });

  it("throws error code from response body on non-ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ errors: [{ code: "UNAUTHORIZED" }] }),
    });
    await expect(chatRequest("hi", {})).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("insightRequest", () => {
  it("returns insight string on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ insight: "Go for a walk today!" }),
    });
    const result = await insightRequest();
    expect(result).toEqual({ insight: "Go for a walk today!" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/ai/insight"),
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("returns null insight when backend has none", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ insight: null }),
    });
    const result = await insightRequest();
    expect(result).toEqual({ insight: null });
  });

  it("throws NETWORK_ERROR on TypeError", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(insightRequest()).rejects.toThrow("NETWORK_ERROR");
  });
});

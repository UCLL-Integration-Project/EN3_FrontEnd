import { apiFetch } from "@services/api-client";
import statusService from "@services/StatusService";
import { StatusRequest, StatusResponse, StatusTypeResponse } from "@types";

jest.mock("@services/api-client", () => ({
  apiFetch: jest.fn(),
}));

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("StatusService", () => {
  const mockStatusType: StatusTypeResponse = {
    id: 1,
    statusType: "ONLINE",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createStatus", () => {
    it("should create a status", async () => {
      const payload: StatusRequest = {
        statusType: mockStatusType,
        message: "Hello world",
      };

      const mockResponse: StatusResponse = {
        id: 1,
        statusType: mockStatusType,
        message: "Hello world",
      };

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusService.createStatus(payload);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAllStatuses", () => {
    it("should return all statuses", async () => {
      const mockResponse: StatusResponse[] = [
        {
          id: 1,
          statusType: mockStatusType,
          message: "First status",
        },
        {
          id: 2,
          statusType: mockStatusType,
          message: "Second status",
        },
      ];

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusService.getAllStatuses();

      expect(mockedApiFetch).toHaveBeenCalledWith("/status", {
        method: "GET",
      });

      expect(result).toEqual(mockResponse);
    });

    it('should return empty array when error is "USER_HAS_NO_STATUSES"', async () => {
      mockedApiFetch.mockRejectedValue(new Error("USER_HAS_NO_STATUSES"));

      const result = await statusService.getAllStatuses();

      expect(result).toEqual([]);
    });

    it("should throw unexpected errors", async () => {
      const error = new Error("NETWORK_ERROR");

      mockedApiFetch.mockRejectedValue(error);

      await expect(statusService.getAllStatuses()).rejects.toThrow("NETWORK_ERROR");
    });
  });

  describe("getStatusById", () => {
    it("should return a status by id", async () => {
      const mockResponse: StatusResponse = {
        id: 1,
        statusType: mockStatusType,
        message: "Single status",
      };

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusService.getStatusById(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/1", {
        method: "GET",
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateStatus", () => {
    it("should update a status", async () => {
      const payload: StatusRequest = {
        statusType: mockStatusType,
        message: "Updated status",
      };

      const mockResponse: StatusResponse = {
        id: 1,
        statusType: mockStatusType,
        message: "Updated status",
      };

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusService.updateStatus(1, payload);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/1", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteStatus", () => {
    it("should delete a status", async () => {
      mockedApiFetch.mockResolvedValue(undefined);

      await statusService.deleteStatus(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/1", {
        method: "DELETE",
      });
    });
  });
});

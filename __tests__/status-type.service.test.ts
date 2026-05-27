import { apiFetch } from "@services/api-client";
import statusTypeService from "@services/StatusTypeService";
import { StatusTypeRequest, StatusTypeResponse } from "@types";

jest.mock("@services/api-client", () => ({
  apiFetch: jest.fn(),
}));

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("StatusTypeService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStatusTypes", () => {
    it("should return all status types", async () => {
      const mockResponse: StatusTypeResponse[] = [
        {
          id: 1,
          statusType: "ONLINE",
        },
        {
          id: 2,
          statusType: "OFFLINE",
        },
      ];

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusTypeService.getStatusTypes();

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/type", {
        method: "GET",
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getStatusTypeById", () => {
    it("should return a status type by id", async () => {
      const mockResponse: StatusTypeResponse = {
        id: 1,
        statusType: "ONLINE",
      };

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusTypeService.getStatusTypeById(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/type/1", {
        method: "GET",
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("createStatusType", () => {
    it("should create a status type", async () => {
      const payload: StatusTypeRequest = {
        statusType: "BUSY",
      };

      const mockResponse: StatusTypeResponse = {
        id: 3,
        statusType: "BUSY",
      };

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusTypeService.createStatusType(payload);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/type", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateStatusType", () => {
    it("should update a status type", async () => {
      const payload: StatusTypeRequest = {
        statusType: "AWAY",
      };

      const mockResponse: StatusTypeResponse = {
        id: 1,
        statusType: "AWAY",
      };

      mockedApiFetch.mockResolvedValue(mockResponse);

      const result = await statusTypeService.updateStatusType(1, payload);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/type/1", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteStatusType", () => {
    it("should delete a status type", async () => {
      mockedApiFetch.mockResolvedValue(undefined);

      await statusTypeService.deleteStatusType(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/status/type/1", {
        method: "DELETE",
      });
    });
  });
});

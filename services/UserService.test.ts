import * as UserService from "./UserService";
import { ConnectionDTO, ConnectionLevel } from "@types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

describe("UserService - Connection Levels", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getConnectionsRequest", () => {
    it("should fetch connections with levels", async () => {
      const mockConnections: ConnectionDTO[] = [
        {
          id: 1,
          username: "user1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          age: 25,
          connectionsCount: 5,
          password: "",
          level: "CONTACT"
        },
        {
          id: 2,
          username: "user2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          age: 26,
          connectionsCount: 3,
          password: "",
          level: "BEST_FRIEND"
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockConnections)
      });

      const result = await UserService.getConnectionsRequest();

      expect(result).toEqual(mockConnections);
      expect(global.fetch).toHaveBeenCalledWith(`${apiUrl}/api/connections`, {
        method: "GET",
        credentials: "include"
      });
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Network error"));

      await expect(UserService.getConnectionsRequest()).rejects.toThrow("NETWORK_ERROR");
    });

    it("should handle server errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ errors: [{ code: "UNKNOWN_ERROR" }] })
      });

      await expect(UserService.getConnectionsRequest()).rejects.toThrow("UNKNOWN_ERROR");
    });
  });

  describe("setConnectionLevelRequest", () => {
    it("should update connection level to CONTACT", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await UserService.setConnectionLevelRequest("user1", "CONTACT");

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/connections/user1/level`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: "CONTACT" }),
          credentials: "include"
        }
      );
    });

    it("should update connection level to FRIEND", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await UserService.setConnectionLevelRequest("user2", "FRIEND");

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/connections/user2/level`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: "FRIEND" }),
          credentials: "include"
        }
      );
    });

    it("should update connection level to BEST_FRIEND", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await UserService.setConnectionLevelRequest("user3", "BEST_FRIEND");

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/connections/user3/level`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: "BEST_FRIEND" }),
          credentials: "include"
        }
      );
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Network error"));

      await expect(UserService.setConnectionLevelRequest("user1", "FRIEND")).rejects.toThrow(
        "NETWORK_ERROR"
      );
    });

    it("should handle server errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ errors: [{ code: "UNKNOWN_ERROR" }] })
      });

      await expect(UserService.setConnectionLevelRequest("user1", "FRIEND")).rejects.toThrow(
        "UNKNOWN_ERROR"
      );
    });

    it("should encode username in URL", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await UserService.setConnectionLevelRequest("user@example.com", "CONTACT");

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/connections/user%40example.com/level`,
        expect.any(Object)
      );
    });
  });

  describe("addConnectionRequest", () => {
    it("should create connection and default to CONTACT level", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await UserService.addConnectionRequest("newuser");

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/connections/newuser`,
        {
          method: "POST",
          credentials: "include"
        }
      );
    });
  });

  describe("removeConnectionRequest", () => {
    it("should remove connection and both directions", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await UserService.removeConnectionRequest("user1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/connections/user1`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );
    });
  });
});

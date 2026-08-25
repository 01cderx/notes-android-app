import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import api from "./api";

const TOKEN_KEY = "notes_auth_token";

const storage = {
  async setToken(token) {
    if (!token) {
      return;
    }

    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  async getToken() {
    if (Platform.OS === "web") {
      return localStorage.getItem(TOKEN_KEY);
    }

    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken() {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },
};

const authService = {
  // =========================
  // REGISTER
  // =========================
  async register(email, password) {
    try {
      const response = await api.post("/auth/register", {
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("REGISTER API RESPONSE:", response);

      if (response?.token) {
        await storage.setToken(response.token);
        console.log("Registration token stored successfully");
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);

      return {
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Registration failed.",
      };
    }
  },

  // =========================
  // LOGIN
  // =========================
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("LOGIN API RESPONSE:", response);

      if (response?.token) {
        await storage.setToken(response.token);

        console.log("Login token stored successfully");
      } else {
        console.warn("Login response does not contain a token");
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);

      return {
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Login failed.",
      };
    }
  },

  // =========================
  // GET CURRENT USER
  // =========================
  async getUser() {
    try {
      const token = await storage.getToken();

      console.log(
        "Stored token exists:",
        Boolean(token)
      );

      if (!token) {
        return null;
      }

      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("CURRENT USER RESPONSE:", response);

      return response?.user || null;
    } catch (error) {
      console.error("Get user error:", error);

      await storage.removeToken();

      return null;
    }
  },

  // =========================
  // GET TOKEN
  // =========================
  async getToken() {
    return await storage.getToken();
  },

  // =========================
  // LOGOUT
  // =========================
  async logout() {
    try {
      await storage.removeToken();

      console.log("Token removed successfully");

      return {
        success: true,
      };
    } catch (error) {
      console.error("Logout error:", error);

      return {
        error:
          error?.message ||
          "Logout failed.",
      };
    }
  },
};

export default authService;
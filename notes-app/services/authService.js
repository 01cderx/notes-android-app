import * as SecureStore from "expo-secure-store";
import { api } from "./api";

const TOKEN_KEY = "auth_token";

export const register = async (email, password) => {
  const data = await api.post("/auth/register", {
    email,
    password,
  });

  await SecureStore.setItemAsync(TOKEN_KEY, data.token);

  return data;
};

export const login = async (email, password) => {
  const data = await api.post("/auth/login", {
    email,
    password,
  });

  await SecureStore.setItemAsync(TOKEN_KEY, data.token);

  return data;
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const logout = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const getCurrentUser = async () => {
  const token = await getToken();

  if (!token) {
    return null;
  }

  try {
    const data = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data.user;
  } catch {
    await logout();
    return null;
  }
};

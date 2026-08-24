import { api } from "./api";
import { getToken } from "./authService";

const authHeaders = async () => {
  const token = await getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getNotes = async () => {
  const headers = await authHeaders();

  const response = await api.get("/notes", {
    headers,
  });

  return response.data;
};

export const createNote = async (text) => {
  const headers = await authHeaders();

  const response = await api.post(
    "/notes",
    { text },
    { headers }
  );

  return response.data;
};

export const updateNote = async (id, text) => {
  const headers = await authHeaders();

  const response = await api.put(
    `/notes/${id}`,
    { text },
    { headers }
  );

  return response.data;
};

export const deleteNote = async (id) => {
  const headers = await authHeaders();

  return await api.delete(`/notes/${id}`, {
    headers,
  });
};

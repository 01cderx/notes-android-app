import api from "./api";
import authService from "./authService";

const getAuthHeaders = async () => {
  const token = await authService.getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const noteService = {
  async getNotes() {
    try {
      const headers = await getAuthHeaders();

      const response = await api.get("/notes", {
        headers,
      });

      return {
        data: response.data || [],
        error: null,
      };
    } catch (error) {
      console.error("Error fetching notes:", error.message);

      return {
        data: [],
        error: error.message,
      };
    }
  },

  async addNote(text) {
    if (!text || !text.trim()) {
      return {
        error: "Note text cannot be empty",
      };
    }

    try {
      const headers = await getAuthHeaders();

      const response = await api.post(
        "/notes",
        {
          text: text.trim(),
        },
        {
          headers,
        }
      );

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error("Error creating note:", error.message);

      return {
        error: error.message,
      };
    }
  },

  async updateNote(id, text) {
    if (!text || !text.trim()) {
      return {
        error: "Note text cannot be empty",
      };
    }

    try {
      const headers = await getAuthHeaders();

      const response = await api.put(
        `/notes/${id}`,
        {
          text: text.trim(),
        },
        {
          headers,
        }
      );

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error("Error updating note:", error.message);

      return {
        error: error.message,
      };
    }
  },

  async deleteNote(id) {
    try {
      const headers = await getAuthHeaders();

      await api.delete(`/notes/${id}`, {
        headers,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting note:", error.message);

      return {
        error: error.message,
      };
    }
  },
};

export default noteService;
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether a user is already authenticated
  const checkUser = async () => {
    try {
      console.log("Checking existing user...");

      const currentUser = await authService.getUser();

      console.log("CURRENT USER:", currentUser);

      setUser(currentUser || null);
    } catch (error) {
      console.error("Failed to check user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      console.log("AUTH CONTEXT: Logging in...");

      const response = await authService.login(
        email,
        password
      );

      console.log("AUTH CONTEXT RESPONSE:", response);

      if (response?.error) {
        return response;
      }

      if (!response?.user) {
        console.error(
          "Login succeeded but no user was returned:",
          response
        );

        return {
          error: "Login succeeded but user information was not returned.",
        };
      }

      // Update authentication state
      setUser(response.user);

      console.log("USER SET:", response.user);

      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Login failed",
      };
    }
  };

  // Register
  const register = async (email, password) => {
    try {
      console.log("AUTH CONTEXT: Registering...");

      const response = await authService.register(
        email,
        password
      );

      console.log(
        "AUTH CONTEXT REGISTER RESPONSE:",
        response
      );

      if (response?.error) {
        return response;
      }

      if (!response?.user) {
        return {
          error:
            "Registration succeeded but user information was not returned.",
        };
      }

      setUser(response.user);

      console.log("USER SET:", response.user);

      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      console.error("Register error:", error);

      return {
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Registration failed",
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom authentication hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
};
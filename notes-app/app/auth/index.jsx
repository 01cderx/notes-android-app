import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/contexts/authContext";

const AuthScreen = () => {
  const router = useRouter();

  const {
    login,
    register,
    user,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect after AuthContext updates the user
  useEffect(() => {
    if (!authLoading && user) {
      console.log("Authenticated user detected:", user);
      console.log("Redirecting to /notes...");

      router.replace("/notes");
    }
  }, [user, authLoading, router]);

  const handleAuth = async () => {
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Email and password are required");
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      let response;

      if (isRegistering) {
        response = await register(trimmedEmail, password);
      } else {
        response = await login(trimmedEmail, password);
      }

      console.log("AUTH RESPONSE:", response);

      if (response?.error) {
        setError(response.error);
        Alert.alert("Authentication Error", response.error);
        return;
      }

      console.log(
        isRegistering
          ? "REGISTRATION SUCCESS"
          : "LOGIN SUCCESS"
      );

      console.log("RESPONSE USER:", response?.user);

      // Do NOT navigate here.
      // AuthContext should update `user`.
      // The useEffect above handles navigation.

    } catch (error) {
      console.error("AUTH ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";

      setError(message);
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering((previous) => !previous);
    setError("");
    setConfirmPassword("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {isRegistering ? "Sign Up" : "Login"}
      </Text>

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!submitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitting}
      />

      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
        />
      )}

      <TouchableOpacity
        style={[
          styles.button,
          submitting && styles.buttonDisabled,
        ]}
        onPress={handleAuth}
        disabled={submitting}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? "Please wait..."
            : isRegistering
              ? "Sign Up"
              : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={toggleAuthMode}
        disabled={submitting}
      >
        <Text style={styles.switchText}>
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },

  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#007bff",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  switchText: {
    marginTop: 15,
    color: "#007bff",
    fontSize: 16,
  },

  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 16,
    textAlign: "center",
  },
});

export default AuthScreen;
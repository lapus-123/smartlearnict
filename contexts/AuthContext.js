import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config";
import { loginUser, registerUser, setAuthToken } from "../services/api";

const AuthContext = createContext();
const SESSION_KEY = "@smartlearn_session";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wake up backend on app launch
  useEffect(() => {
    fetch(API_URL.replace("/api", "/ping")).catch(() => {});
  }, []);

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          setCurrentUser(session.user);
          setToken(session.token);
          setAuthToken(session.token);
        }
      } catch (_) {}
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await loginUser({ username, password });
      const { token, user, message } = res.data;
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
      setAuthToken(token);
      setCurrentUser(user);
      setToken(token);
      return { success: true, role: user.role, message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Connection error.",
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await registerUser(formData);
      return {
        success: true,
        message: res.data.message,
        hint: res.data.hint,
        pending: res.data.pending,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Connection error.",
      };
    }
  };

  // Call this after uploading avatar to persist new avatarUrl in session
  const updateUser = async (updates) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...session, user: updated }),
      );
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

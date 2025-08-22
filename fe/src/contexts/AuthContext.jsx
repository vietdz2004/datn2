import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) {
          setLoading(false);
          return;
        }

        try {
          const userData = JSON.parse(savedUser);
          console.log("🔍 Restored user from localStorage:", userData);

          setUser(userData);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error("Error parsing saved user data:", parseError);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);

      console.log("🔍 Login response:", response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;

        console.log("👤 User data:", user);
        console.log("🔑 Token received:", token ? "Yes" : "No");

        // Store token and user in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update state
        setUser(user);
        setIsAuthenticated(true);

        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);

      console.log("🔍 Register response:", response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;

        console.log("👤 User data:", user);
        console.log("🔑 Token received:", token ? "Yes" : "No");

        // Store token and user in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update state
        setUser(user);
        setIsAuthenticated(true);

        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Đăng ký thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Don't call API logout since we don't have this endpoint
      console.log("Logging out user...");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API response
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Cập nhật thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const response = await authAPI.googleLogin(idToken);

      if (response.data.success) {
        const { token, user: userData } = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Google login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập Google thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

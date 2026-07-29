import React, { createContext, useContext, useReducer, useEffect } from "react";

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  LOAD_USER: "LOAD_USER",
  CLEAR_ERRORS: "CLEAR_ERRORS",
};

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: true, // Start with loading true to check auth status
  error: null,
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API Base URL - Update this to match your backend
  const API_BASE_URL = "http://localhost:5000/api";

  // Set auth token in headers
  const setAuthToken = (token) => {
    if (token) {
      // Set default header for all requests
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthToken(token);

      try {
        console.log("Loading user with token:", token);
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);
        const result = await response.json();
        console.log("Response data:", result);

        if (response.ok && result.success) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: result.data,
          });
        } else {
          console.log("Failed to load user, logging out");
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error("Error loading user:", error);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Register user
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login user after successful registration
        if (data.data && data.data.token) {
          setAuthToken(data.data.token);
          dispatch({
            type: AUTH_ACTIONS.REGISTER_SUCCESS,
            payload: {
              user: data.data.user,
              token: data.data.token,
            },
          });

          return {
            success: true,
            data,
            message: data.message || "Registration successful!",
            redirectTo:
              data.data.user.role === "doctor"
                ? "/doctor/dashboard"
                : "/patient/dashboard",
          };
        } else {
          // Fallback to login redirect if no token
          dispatch({
            type: AUTH_ACTIONS.REGISTER_SUCCESS,
            payload: { user: null, token: null },
          });

          return {
            success: true,
            data,
            message:
              "Registration successful! Please sign in with your credentials.",
            redirectTo: "/auth/login",
          };
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: data.message || "Registration failed",
        });
        return { success: false, error: data.message || "Registration failed" };
      }
    } catch (error) {
      const errorMessage =
        "Network error. Please check your connection and try again.";
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthToken(data.data.token);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.data.user,
            token: data.data.token,
          },
        });

        return { success: true, data };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: data.message || "Login failed",
        });
        return { success: false, error: data.message || "Login failed" };
      }
    } catch (error) {
      const errorMessage = "Network error. Please try again.";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user && state.user.role === role;
  };

  // Check if user is patient
  const isPatient = () => hasRole("patient");

  // Check if user is doctor
  const isDoctor = () => hasRole("doctor");

  // Load user on component mount
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    register,
    login,
    logout,
    loadUser,
    clearErrors,

    // Utilities
    hasRole,
    isPatient,
    isDoctor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;

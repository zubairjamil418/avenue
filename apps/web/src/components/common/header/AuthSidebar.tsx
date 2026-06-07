"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import API_ENDPOINTS from "@/constants/endpoints";
import { toast } from "sonner";

// Firebase imports
import { auth } from "@/lib/firebase/config";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  AuthProvider,
} from "firebase/auth";

// Helper to safely extract error messages from unknown catch values
interface ApiError {
  code?: string;
  message?: string;
  data?: { message?: string };
  response?: { data?: { message?: string } };
}
function toApiError(err: unknown): ApiError {
  return err && typeof err === "object" ? (err as ApiError) : {};
}

export type AuthView =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "otp";

const AuthSidebar = ({ logoUrl }: { logoUrl?: string }) => {
  const { isAuthOpen, onAuthClose, authView } = useHeaderStore();
  const { login } = useAuthStore();
  const [currentView, setCurrentView] = useState<AuthView>(authView);
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Registration state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Forgot password flow state
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [resetPasswordState, setResetPasswordState] = useState({
    password: "",
    confirmPassword: "",
  });

  // Sync currentView with the store's authView when the sidebar opens
  useEffect(() => {
    if (isAuthOpen) {
      setCurrentView(authView);
      // Reset form data when sidebar opens
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setLoginData({
        email: "",
        password: "",
      });
      setForgotEmail("");
      setOtpValues(Array(6).fill(""));
      setResetPasswordState({ password: "", confirmPassword: "" });
    }
  }, [isAuthOpen, authView]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Map ids to state keys
    const keyMap: Record<string, string> = {
      "first-name": "firstName",
      "last-name": "lastName",
      "register-email": "email",
      "register-password": "password",
      "confirm-password": "confirmPassword",
    };

    const key = keyMap[id];
    if (key) {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "login-email") {
      setLoginData((prev) => ({ ...prev, email: value }));
    } else if (id === "login-password") {
      setLoginData((prev) => ({ ...prev, password: value }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
      const data = response.data;

      // The API returns the user object with the token inside it
      // Standardize: extract token and user
      const token = data.token;
      if (!token) {
        throw new Error("Invalid response from server: missing token");
      }

      // data IS the user object (plus the token)
      login(data, token);
      toast.success("Login successful!");

      // Close sidebar after a short delay
      setTimeout(() => {
        onAuthClose();
        setIsLoading(false);
      }, 500);

      // Reset form
      setLoginData({ email: "", password: "" });
    } catch (error: unknown) {
      const err = toApiError(error);
      const message =
        err.data?.message || err.response?.data?.message || err.message || "Invalid credentials";
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });

      toast.success("Registration successful! Please login.");
      setCurrentView("login");
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
    } catch (error: unknown) {
      const err = toApiError(error);
      const message =
        err.data?.message || err.response?.data?.message || err.message || "Registration failed";
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: forgotEmail,
      });
      toast.success("Verification code sent to your email!");
      setCurrentView("otp");
    } catch (error: unknown) {
      const err = toApiError(error);
      toast.error(
        err.data?.message || err.response?.data?.message || "Failed to send verification code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtpValues(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      const nextInput = document.getElementById(
        `otp-${nextIndex}`,
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    } else {
      const newOtp = [...otpValues];
      // Only digits
      if (value && !/^\\d+$/.test(value)) return;
      newOtp[index] = value;
      setOtpValues(newOtp);
      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(
          `otp-${index + 1}`,
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`,
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpValues.join("");
    if (token.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { token });
      toast.success("Code verified successfully!");
      setCurrentView("reset-password");
    } catch (error: unknown) {
      const err = toApiError(error);
      toast.error(err.data?.message || err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordState.password !== resetPasswordState.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (resetPasswordState.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const token = otpValues.join("");
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: resetPasswordState.password,
      });
      toast.success("Password reset successful! Please login.");
      setCurrentView("login");
      setForgotEmail("");
      setOtpValues(Array(6).fill(""));
      setResetPasswordState({ password: "", confirmPassword: "" });
    } catch (error: unknown) {
      const err = toApiError(error);
      toast.error(err.data?.message || err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (providerName: "google" | "facebook") => {
    setIsLoading(true);
    try {
      let provider: AuthProvider;
      if (providerName === "google") {
        provider = new GoogleAuthProvider();
      } else {
        provider = new FacebookAuthProvider();
      }

      // 1. Authenticate with Firebase
      if (!auth) throw new Error("Firebase auth is not configured.");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // 2. Send user data to backend
      const response = await api.post("/api/auth/oauth", {
        avatar: user.photoURL,
        authProvider: providerName,
        idToken,
      });

      const data = response.data;
      const token = data.data?.token;

      if (!token) {
        throw new Error("Invalid response from server: missing token");
      }

      // 3. Log user in
      login(data.data, token);
      toast.success(
        `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Login successful!`,
      );

      // Close sidebar after a short delay
      setTimeout(() => {
        onAuthClose();
        setIsLoading(false);
      }, 500);
    } catch (error: unknown) {
      const err = toApiError(error);
      console.warn(`${providerName} auth error:`, err.message || error);

      // Handle Firebase specific errors gracefully
      if (err.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in popup was closed before completing.");
      } else if (
        err.code === "auth/account-exists-with-different-credential"
      ) {
        toast.error(
          "An account already exists with the same email address but different sign-in credentials.",
        );
      } else {
        const message =
          err.data?.message ||
          err.response?.data?.message ||
          err.message ||
          `${providerName} authentication failed`;
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let title = "";
    switch (currentView) {
      case "login": title = "Log in"; break;
      case "register": title = "Create Account"; break;
      case "forgot-password": title = "Forgot Password"; break;
      case "reset-password": title = "Set Password"; break;
      case "otp": title = "OTP Verification"; break;
    }

    return (
      <SheetHeader className="flex flex-row items-center justify-between px-8 py-5 border-b border-[var(--gray-200)] bg-white sticky top-0 z-10 space-y-0">
        <SheetTitle
          style={{
            fontFamily: "'Playfair Display', var(--font-playfair), serif",
            fontSize: "1.05rem",
            fontWeight: 400,
            color: "#000",
          }}
        >
          {title}
        </SheetTitle>
        <button onClick={onAuthClose} className="text-[var(--gray-600)] hover:text-black transition-colors">
          <X className="size-5" />
        </button>
      </SheetHeader>
    );
  };

  const renderLoginView = () => (
    <div key="login" className="flex flex-col gap-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-center py-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Avenue" style={{ height: "25px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>AVENUE</span>
        )}
      </div>

      <div className="flex gap-x-3">
        <button type="button" onClick={() => handleOAuth("google")} disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-x-2 py-2.5 border border-[var(--gray-300)] hover:bg-[var(--gray-50)] transition-colors disabled:opacity-50"
          style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>
          <img src="https://www.google.com/favicon.ico" alt="Google" className="size-4" />
          Google
        </button>
        <button type="button" onClick={() => handleOAuth("facebook")} disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-x-2 py-2.5 border border-[var(--gray-300)] hover:bg-[var(--gray-50)] transition-colors disabled:opacity-50"
          style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>
          <span className="text-blue-600 font-bold">f</span>
          Facebook
        </button>
      </div>

      <div className="relative flex items-center gap-x-3">
        <span className="flex-1 border-t border-[var(--gray-200)]" />
        <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>or</span>
        <span className="flex-1 border-t border-[var(--gray-200)]" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-y-4">
        <div>
          <label htmlFor="login-email" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Email *</label>
          <input type="email" id="login-email" value={loginData.email} onChange={handleLoginChange} required disabled={isLoading}
            style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "#000"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
          />
        </div>
        <div>
          <label htmlFor="login-password" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Password *</label>
          <div className="relative">
            <input type={showLoginPassword ? "text" : "password"} id="login-password" value={loginData.password} onChange={handleLoginChange} required disabled={isLoading}
              style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 2.5rem 0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#000"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
            />
            <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-500)] hover:text-black transition-colors">
              {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={() => setCurrentView("forgot-password")} disabled={isLoading}
            style={{ fontSize: "0.8rem", color: "#000", textDecoration: "underline" }}>
            Forgot Your Password?
          </button>
        </div>
        <button type="submit" disabled={isLoading}
          style={{ width: "100%", background: "#000", color: "#fff", padding: "0.9rem", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 400, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign In"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--gray-500)" }}>
        Don&apos;t have an account?{" "}
        <button onClick={() => setCurrentView("register")} disabled={isLoading} style={{ color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>
          Create Account
        </button>
      </p>
    </div>
  );

  const renderRegisterView = () => (
    <div key="register" className="flex flex-col gap-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-center py-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Avenue" style={{ height: "25px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>AVENUE</span>
        )}
      </div>

      <div className="flex gap-x-3">
        <button type="button" onClick={() => handleOAuth("google")} disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-x-2 py-2.5 border border-[var(--gray-300)] hover:bg-[var(--gray-50)] transition-colors disabled:opacity-50"
          style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>
          <img src="https://www.google.com/favicon.ico" alt="Google" className="size-4" />
          Google
        </button>
        <button type="button" onClick={() => handleOAuth("facebook")} disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-x-2 py-2.5 border border-[var(--gray-300)] hover:bg-[var(--gray-50)] transition-colors disabled:opacity-50"
          style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>
          <span className="text-blue-600 font-bold">f</span>
          Facebook
        </button>
      </div>

      <div className="relative flex items-center gap-x-3">
        <span className="flex-1 border-t border-[var(--gray-200)]" />
        <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>or</span>
        <span className="flex-1 border-t border-[var(--gray-200)]" />
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-y-4">
        <div className="grid grid-cols-2 gap-x-3">
          <div>
            <label htmlFor="first-name" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>First Name *</label>
            <input type="text" id="first-name" value={formData.firstName} onChange={handleInputChange} required disabled={isLoading}
              style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#000"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
            />
          </div>
          <div>
            <label htmlFor="last-name" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Last Name *</label>
            <input type="text" id="last-name" value={formData.lastName} onChange={handleInputChange} required disabled={isLoading}
              style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#000"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
            />
          </div>
        </div>
        <div>
          <label htmlFor="register-email" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Email *</label>
          <input type="email" id="register-email" value={formData.email} onChange={handleInputChange} required disabled={isLoading}
            style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "#000"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
          />
        </div>
        <div>
          <label htmlFor="register-password" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Password *</label>
          <div className="relative">
            <input type={showRegisterPassword ? "text" : "password"} id="register-password" value={formData.password} onChange={handleInputChange} required disabled={isLoading}
              style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 2.5rem 0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#000"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
            />
            <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-500)] hover:text-black transition-colors">
              {showRegisterPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Confirm Password *</label>
          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} id="confirm-password" value={formData.confirmPassword} onChange={handleInputChange} required disabled={isLoading}
              style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 2.5rem 0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "#000"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-500)] hover:text-black transition-colors">
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={isLoading}
          style={{ width: "100%", background: "#000", color: "#fff", padding: "0.9rem", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 400, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.5rem" }}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Create Account"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--gray-500)" }}>
        Already have an account?{" "}
        <button onClick={() => setCurrentView("login")} disabled={isLoading} style={{ color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>
          Sign In
        </button>
      </p>
    </div>
  );

  const renderForgotPasswordView = () => (
    <div key="forgot-password" className="flex flex-col gap-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-center py-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Avenue" style={{ height: "25px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>AVENUE</span>
        )}
      </div>
      <form className="flex flex-col gap-y-4" onSubmit={handleForgotPasswordSubmit}>
        <div>
          <label htmlFor="forgot-email" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Email *</label>
          <input type="email" id="forgot-email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required disabled={isLoading}
            style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "#000"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
          />
        </div>
        <button type="submit" disabled={isLoading}
          style={{ width: "100%", background: "#000", color: "#fff", padding: "0.9rem", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 400, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.5rem" }}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Send Verification Code"}
        </button>
      </form>
      <button onClick={() => setCurrentView("login")} disabled={isLoading}
        style={{ fontSize: "0.8rem", color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        Back to Sign in
      </button>
    </div>
  );

  const renderOtpView = () => (
    <div key="otp" className="flex flex-col gap-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-center py-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Avenue" style={{ height: "25px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>AVENUE</span>
        )}
      </div>
      <div className="text-center">
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 400, marginBottom: "0.4rem" }}>Enter the verification code</p>
        <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>Enter the 6-digit code sent to your email address</p>
      </div>
      <div className="flex justify-between gap-x-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input key={index} id={`otp-${index}`} type="text" placeholder="-" maxLength={6}
            value={otpValues[index]}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            disabled={isLoading}
            style={{ width: "100%", height: "52px", border: "1px solid var(--gray-300)", borderRadius: 0, textAlign: "center", fontSize: "1.2rem", fontWeight: 500, outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "#000"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
          />
        ))}
      </div>
      <div className="text-right">
        <button type="button" onClick={handleForgotPasswordSubmit} disabled={isLoading}
          style={{ fontSize: "0.8rem", color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
          Resend The Code
        </button>
      </div>
      <button onClick={handleOtpSubmit} disabled={isLoading || otpValues.join("").length !== 6}
        style={{ width: "100%", background: "#000", color: "#fff", padding: "0.9rem", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 400, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: otpValues.join("").length !== 6 ? 0.5 : 1 }}>
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
      </button>
      <button onClick={() => setCurrentView("forgot-password")}
        style={{ fontSize: "0.8rem", color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        Back to Forgot Password
      </button>
    </div>
  );

  const renderResetPasswordView = () => (
    <div key="reset-password" className="flex flex-col gap-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-center py-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Avenue" style={{ height: "25px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>AVENUE</span>
        )}
      </div>
      <form className="flex flex-col gap-y-4" onSubmit={handleResetPasswordSubmit}>
        <div>
          <label htmlFor="new-password" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>New Password *</label>
          <input type="password" id="new-password" value={resetPasswordState.password}
            onChange={(e) => setResetPasswordState((prev) => ({ ...prev, password: e.target.value }))}
            required disabled={isLoading}
            style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "#000"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
          />
        </div>
        <div>
          <label htmlFor="confirm-reset-password" style={{ display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gray-600)", marginBottom: "0.35rem" }}>Confirm Password *</label>
          <input type="password" id="confirm-reset-password" value={resetPasswordState.confirmPassword}
            onChange={(e) => setResetPasswordState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            required disabled={isLoading}
            style={{ width: "100%", border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.75rem 1rem", fontSize: "0.9rem", outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "#000"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
          />
        </div>
        <button type="submit" disabled={isLoading}
          style={{ width: "100%", background: "#000", color: "#fff", padding: "0.9rem", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 400, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.5rem" }}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Change Password"}
        </button>
      </form>
      <button onClick={() => setCurrentView("login")}
        style={{ fontSize: "0.8rem", color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
        Back to Login
      </button>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "login":
        return renderLoginView();
      case "register":
        return renderRegisterView();
      case "forgot-password":
        return renderForgotPasswordView();
      case "otp":
        return renderOtpView();
      case "reset-password":
        return renderResetPasswordView();
      default:
        return renderLoginView();
    }
  };

  return (
    <Sheet open={isAuthOpen} onOpenChange={onAuthClose}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-[480px] p-0 border-none overflow-hidden shadow-xl"
        showCloseButton={false}
      >
        {renderHeader()}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AuthSidebar;

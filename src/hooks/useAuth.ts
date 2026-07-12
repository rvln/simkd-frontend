"use client";

import { useState, useEffect, useCallback } from "react";
import { fetcher } from "@/lib/fetcher";

/**
 * Strict role values returned by the backend RoleEnum.
 * MUST match App\Enums\RoleEnum exactly.
 */
export type UserRole = "PENGUNJUNG" | "PENGURUS_PANTI" | "KEPALA_PANTI";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string | null;
  email_verified_at: string | null;
}

export interface AuthState {
  /** The authenticated user object, or null if loading/unauthenticated */
  user: AuthUser | null;
  /** True while the initial fetch is in-flight */
  isLoading: boolean;
  /** True if a valid token exists AND the user fetch succeeded */
  isAuthenticated: boolean;
  /** Re-fetch the user (e.g., after profile update) */
  refetch: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * useAuth — Central authentication hook.
 */
export function useAuth(): AuthState & { 
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  loading: boolean;
  errors: any;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const json: any = await fetcher('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(json.data as AuthUser);
    } catch {
      localStorage.removeItem("auth_token");
      window.dispatchEvent(new Event("storage"));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = async (data: RegisterData) => {
    setLoading(true);
    setErrors(null);
    try {
      await fetcher.get('/sanctum/csrf-cookie'); 
      await fetcher.post('/api/register', data);
      
      // Setelah register, arahkan ke info verifikasi
      window.location.pathname = '/verify-email/pending'; 
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: ['Terjadi kesalahan pada server.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true);
    setErrors(null);
    try {
      await fetcher.post('/api/verify-email', { token });
      window.location.href = '/login?verified=true';
    } catch (error: any) {
      setErrors({ general: [error.message || 'Token tidak valid atau kadaluarsa.'] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const handleStorageChange = () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
      } else {
        fetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch: fetchUser,
    register,
    verifyEmail,
    loading,
    errors,
  };
}


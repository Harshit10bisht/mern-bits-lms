import apiClient from "./client";

export type Role = "student" | "staff" | "admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const fetchProfile = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<{ user: AuthUser }>("/auth/me");
  return data.user;
};


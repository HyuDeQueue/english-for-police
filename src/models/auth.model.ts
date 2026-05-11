import type { User } from "./user.model";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  dateOfBirth: string;
}

export interface RegisterResponse {
  code: string;
  data: User;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

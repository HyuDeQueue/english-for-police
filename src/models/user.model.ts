export const UserRole = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  userId: number;
  shownId: string;
  email: string;
  fullName: string;
  role: UserRole;
  dateOfBirth: string;
}

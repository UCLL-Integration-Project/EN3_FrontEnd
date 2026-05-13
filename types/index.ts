export type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
};

export type UserInput = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
};

export type User = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  age?: number;
  role?: string;
  token?: string;
};

export type UserResponse = {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
};

export type AuthenticationRequest = {
  email: string;
  password: string;
};

export type Role = "USER" | "ADMIN";

export function toGrantedAuthority(role: Role): string {
  return `ROLE_${role}`;
}

export type AuthenticationResponse = {
  message: string;
  token: string;
  email: string;
  fullname: string;
  role: Role;
};

export type StatusMessage = {
  message: string;
  type: "error" | "success";
};

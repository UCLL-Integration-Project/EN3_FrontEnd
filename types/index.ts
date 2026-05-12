export type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
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
  height?: number;
  weight?: number;
};

export type AuthenticationRequest = {
  username: string;
  password: string;
};

export type Role = "USER" | "ADMIN";

export function toGrantedAuthority(role: Role): string {
  return `ROLE_${role}`;
}

export type AuthenticationResponse = {
  message: string;
  token: string;
  username: string;
  fullname: string;
  role: Role;
};

export type StatusMessage = {
  message: string;
  type: "error" | "success";
};

export type ExerciseTemplate = {
  id?: string;
  name: string;
  description: string;
  expectedReps: number;
  expectedSets: number;
  expectedWeight: number;
};

export type ExerciseInstance = {
  reps: number;
  sets: number;
  weight: number;
};

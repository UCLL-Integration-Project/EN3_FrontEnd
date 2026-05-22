export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
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
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  connectionsCount?: number;
};

export type UserResponse = {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  connectionsCount?: number;
  role?: Role;
};

export type AuthenticationRequest = {
  email: string;
  password: string;
  mfaEnabled: boolean;
};

export type Role = "USER" | "ADMIN";

export function toGrantedAuthority(role: Role): string {
  return `ROLE_${role}`;
}

export type Status = "ACTIVE" | "FLAGGED" | "SUSPENDED";

export type AdminMemberSummary = {
  id: number;
  displayName: string;
  handle: string;
  email: string;
  avatarUrl?: string | null;
  status: Status;
  joinedAt: string; // ISO timestamp from the backend's Instant
};

export type AdminAction = "SUSPEND" | "REACTIVATE" | "CLEAR_BIO" | "CLEAR_AVATAR" | "FLAG";

export type AdminAuditEntry = {
  id: number;
  actorDisplayName: string;
  action: AdminAction;
  note?: string | null;
  createdAt: string;
};

export type AdminMemberDetail = {
  id: number;
  displayName: string;
  username: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  status: Status;
  joinedAt: string;
  lastSeenAt?: string | null;
  recentAudit: AdminAuditEntry[];
};

/* Spring Data's Page<T> response shape. Keep the fields we actually use. */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

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

export type Activity = {
  id: number;
  type: string;
  description: string;
  timestamp: string;
};

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  age: number;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
};

export type UserStats = {
  connections: number;
  timeActive: number;
  dataShared: number;
};

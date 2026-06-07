export type Role = 'STATION_MANAGER' | 'REGIONAL_MANAGER';

export interface User {
  userId: string;
  userName: string;
  name: string;
  email: string;
  role: Role;
  stationId?: string; // Present for Station Manager
  regionId?: string;  // Present for Regional Manager
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
/**
 * User-related TypeScript types for the e-commerce platform
 */

export interface User {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  role?: 'scout' | 'normal' | 'admin';
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignUpData {
  email: string;
  password?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
}

export interface SignInData {
  email: string;
  password?: string;
}

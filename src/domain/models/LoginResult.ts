export interface LoginResult {
  success: boolean;
  message?: string;
  user?: {
    email: string;
    fullName: string;
    roles: string[];
  };
  expiration?: string;
  errors?: Record<string, string[]>;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
}
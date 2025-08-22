export interface RegisterResult {
  success: boolean;
  message?: string;
  userId?: string;
  errors?: Record<string, string[]>;
  exception?: string;
}
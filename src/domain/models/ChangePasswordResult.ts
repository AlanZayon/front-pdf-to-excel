export interface ChangePasswordResult {
  success: boolean;
  message: string;
  errors?: any[];
  fieldErrors?: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  exception?: any;
}
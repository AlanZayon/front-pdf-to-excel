// domain/models/ChangeUserNameResult.ts
export interface ChangeUserNameResult {
  success: boolean;
  message: string;
  errors?: any[];
  fieldErrors?: {
    newFullName?: string;
  };
  exception?: any;
}
export class ChangePasswordCommand {
  constructor(
    public readonly currentPassword: string,
    public readonly newPassword: string,
    public readonly confirmPassword: string
  ) {}
}
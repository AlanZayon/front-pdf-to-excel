// application/commands/ChangeUserNameCommand.ts
export class ChangeUserNameCommand {
  constructor(public readonly newFullName: string) {}
}
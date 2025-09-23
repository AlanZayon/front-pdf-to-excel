export class UploadCommand {
  constructor(
    public file: File,
    public cnpj?: string | null
  ) {}
}

export class UploadCommand {
  constructor(
    public file: File,
    public cnpj?: string | null,
    public bankCode?: string | null,
    public dateFilterData?: { startDate: string; endDate: string } | null,
  ) {}
}

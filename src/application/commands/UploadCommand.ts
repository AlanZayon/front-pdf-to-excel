export interface ProLaboreData {
  ano: number;
  valor: number | null;
}

export class UploadCommand {
  constructor(
    public file: File,
    public cnpj?: string | null,
    public bankCode?: string | null,
    public dateFilterData?: { startDate: string; endDate: string } | null,
    public readonly proLabore?: ProLaboreData
  ) { }
}

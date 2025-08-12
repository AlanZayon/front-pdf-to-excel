import type { CodigoContaDto } from "../dtos/CodigoContaDto";
import type { ImpostoDto } from "../dtos/ImpostoDto";

export class UpdateImpostosCommand {
  constructor(
    public readonly changes: {
      Id: number;
      Nome: string;
      CodigoDebito: CodigoContaDto | null;
      CodigoCredito: CodigoContaDto | null;
    }[]
  ) {}
  static create(changes: ImpostoDto[]): UpdateImpostosCommand {
    console.log('Criando comando de atualização de impostos com as mudanças:', changes);
    return new UpdateImpostosCommand(
      changes.map(c => ({
        Id: c.id,
        Nome: c.nome,
        CodigoDebito: c.codigoDebito ?? null,
        CodigoCredito: c.codigoCredito ?? null
      }))
    );
  }
}
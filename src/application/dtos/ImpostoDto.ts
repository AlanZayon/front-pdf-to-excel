import type { CodigoContaDto } from './CodigoContaDto'

export interface ImpostoDto {
    id: number
    nome: string
    Code: string
    codigoDebito: CodigoContaDto
    codigoCredito: CodigoContaDto
}
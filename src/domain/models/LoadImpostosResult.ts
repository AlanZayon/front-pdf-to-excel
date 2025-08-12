import type { ImpostoDto } from '../../application/dtos/ImpostoDto'
import type { TaxCodes } from '../../application/interfaces/TaxCodes'

export interface LoadImpostosResult {
    success: boolean
    message: string
    data?: {
        impostos: ImpostoDto[]
        taxCodes: TaxCodes
    }
}
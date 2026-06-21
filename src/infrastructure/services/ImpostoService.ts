import { http } from "../../shared/utils/http";
import { logger } from "../../shared/logging/logger";
import { LoadImpostosCommand } from "../../application/commands/LoadImpostosCommand";
import { UpdateImpostosCommand } from "../../application/commands/UpdateImpostosCommand";
import type { LoadImpostosResult } from "../../domain/models/LoadImpostosResult";
import type { SaveImpostosResult } from "../../domain/models/SaveImpostosResult";
import type { TaxCodes } from "../../application/interfaces/TaxCodes";

export class ImpostoService {
  private static nameToCodeMap: Record<string, string> = {
    'SIMPLES_NACIONAL': 'SIMPLES NACIONAL',
    'PIS': 'PIS',
    'COFINS': 'COFINS',
    'IRPJ': 'IRPJ',
    'CSLL': 'CSLL',
    'ISS': 'ISS',
    'MULTA_JUROS': 'MULTA E JUROS',
    'MULTA': 'MULTA',
    'INSS': 'INSS',
    'IRRF': 'IRRF'
  };

  public static getCodeByName(name: string): string | undefined {
    return this.nameToCodeMap[name];
  }

  static async loadImpostos(_command: LoadImpostosCommand, clienteId?: number | null): Promise<LoadImpostosResult> {
    try {
      const url = clienteId
        ? `/api/configuracao/impostos?clienteId=${clienteId}`
        : '/api/configuracao/impostos'
      const response = await http.get(url, {
        withCredentials: true
      });

      const impostos = response.data;

      const processedImpostos = impostos.map((imposto: any) => ({
        ...imposto,
        Code: this.nameToCodeMap[imposto.nome] || ''
      }));

      const taxCodes: TaxCodes = {};
      processedImpostos.forEach((imposto: any) => {
        if (imposto.Code) {
          taxCodes[imposto.Code] = {
            debito: imposto.codigoDebito?.codigo ? String(imposto.codigoDebito.codigo) : '_',
            credito: imposto.codigoCredito?.codigo ? String(imposto.codigoCredito.codigo) : '_'
          };
        }
      });

      // Garante que IRRF tenha o mesmo código que INSS
      if (taxCodes['INSS'] && taxCodes['IRRF']) {
        taxCodes['IRRF'] = {
          debito: taxCodes['INSS'].debito,
          credito: taxCodes['INSS'].credito
        };
      }

      return {
        success: true,
        message: 'Impostos carregados com sucesso',
        data: {
          impostos: processedImpostos,
          taxCodes
        }
      };

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar impostos';
      logger.error('Erro ao carregar impostos', error);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async updateImpostos(command: UpdateImpostosCommand, clienteId?: number | null): Promise<SaveImpostosResult> {
    try {
      if (command.changes.length === 0) {
        return {
          success: true,
          message: 'Nenhuma alteração para salvar'
        };
      }

      const url = clienteId
        ? `/api/configuracao/impostos?clienteId=${clienteId}`
        : '/api/configuracao/impostos'
      await http.put(url, command.changes, {
        withCredentials: true
      });

      return {
        success: true,
        message: 'Alterações salvas com sucesso'
      };

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar impostos';
      logger.error('Erro ao atualizar impostos', error);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async buscarDescricoes(cnpj: string, codigoBanco?: number | null): Promise<{ success: boolean; data: any[] | null; message: string }> {
    try {
      let url = `/api/configuracao/descricoes?cnpj=${encodeURIComponent(cnpj)}`;

      if (codigoBanco) {
        url += `&codigoBanco=${codigoBanco}`;
      }

      const response = await http.get(url, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = response.data;

      return {
        success: true,
        data: data,
        message: 'Descrições encontradas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar descrições:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Erro ao buscar descrições'
      };
    }
  }

  static async atualizarDescricoes(payload: {
    CNPJ: string;
    CodigoBanco: number | null;
    Atualizacoes: Array<{
      TermoEspecialId: number;
      NovoCodigoDebito: number | null;
      NovoCodigoCredito: number | null;
    }>;
  }): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await http.put(
        '/api/configuracao/descricoes',
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        const errorData = response.data;
        return {
          success: false,
          message: errorData?.message || 'Erro ao atualizar descrições'
        }
      }

      const data = response.data;
      return {
        success: true,
        data: data
      }

    } catch (error) {
      console.error('Erro na requisição:', error)
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      }
    }
  }

  static async exportDescricoesCsv(cnpj: string, codigoBanco?: number | null): Promise<Blob> {
    let url = `/api/configuracao/descricoes/export?cnpj=${encodeURIComponent(cnpj)}`
    if (codigoBanco) url += `&codigoBanco=${codigoBanco}`
    const response = await http.get(url, { withCredentials: true, responseType: 'blob' })
    return response.data
  }

  static async importDescricoesCsv(cnpj: string, file: File, codigoBanco?: number | null): Promise<{ count: number }> {
    const formData = new FormData()
    formData.append('file', file)
    let url = `/api/configuracao/descricoes/import?cnpj=${encodeURIComponent(cnpj)}`
    if (codigoBanco) url += `&codigoBanco=${codigoBanco}`
    const response = await http.post(url, formData, { withCredentials: true })
    return { count: response.data.count ?? 0 }
  }

  static async suggestDescricoes(cnpj: string, termo: string) {
    const response = await http.get('/api/configuracao/descricoes/suggest', {
      withCredentials: true,
      params: { cnpj, termo },
    })
    return response.data as Array<{ termo: string; codigoDebito: number; codigoCredito: number }>
  }

  static async copyDescricoes(payload: {
    cnpjOrigem: string
    cnpjDestino: string
    codigoBancoOrigem?: number | null
    codigoBancoDestino?: number | null
  }): Promise<number> {
    const response = await http.post('/api/configuracao/descricoes/copiar', {
      CnpjOrigem: payload.cnpjOrigem,
      CnpjDestino: payload.cnpjDestino,
      CodigoBancoOrigem: payload.codigoBancoOrigem ?? null,
      CodigoBancoDestino: payload.codigoBancoDestino ?? null,
    }, { withCredentials: true })
    return response.data.count ?? 0
  }
}
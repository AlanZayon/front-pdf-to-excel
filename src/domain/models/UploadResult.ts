export type UploadResult =
  | { success: true; type: 'pdf'; result: any; message: string; outputFile?: string }
  | { success: true; type: 'ofx'; status: 'pending_classification'; transacoesClassificadas: any[]; pendingTransactions: any[]; filePath: string; message: string }
  | { success: true; type: 'ofx'; status: 'completed'; outputFile: string; message: string; transacoesClassificadas: any[] }
  | { success: false; message: string; error?: unknown }

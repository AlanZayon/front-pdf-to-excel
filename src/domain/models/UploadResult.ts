export type UploadResult =
  | { success: true; type: 'pdf'; result: any; message: string; outputFile?: string; jobId?: string }
  | { success: true; type: 'ofx'; status: 'pending_classification'; transacoesClassificadas: any[]; pendingTransactions: any[]; filePath: string; message: string; jobId?: string }
  | { success: true; type: 'ofx'; status: 'completed'; outputFile: string; message: string; transacoesClassificadas: any[]; jobId?: string }
  | { success: false; message: string; error?: unknown }

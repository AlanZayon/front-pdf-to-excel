export type UploadResult =
  | { success: true; type: 'pdf'; result: any; message: string }
  | { success: true; type: 'ofx'; status: 'pending_classification'; transacoesClassificadas: any[]; pendingTransactions: any[]; filePath: string; message: string }
  | { success: true; type: 'ofx'; status: 'completed'; outputPath: string; message: string }
  | { success: false; message: string; error?: string }

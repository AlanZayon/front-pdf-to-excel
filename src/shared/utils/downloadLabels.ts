export function getDownloadButtonLabel(outputFile?: string, fileType?: string): string {
  if (outputFile === 'PGTO.csv') return 'BAIXAR PGTO.CSV'
  if (outputFile === 'EXTRATO.csv') return 'BAIXAR EXTRATO.CSV'
  if (fileType?.toUpperCase() === 'PDF') return 'BAIXAR PGTO.CSV'
  if (fileType?.toUpperCase() === 'OFX') return 'BAIXAR EXTRATO.CSV'
  return 'BAIXAR CSV'
}

export function formatSuccessMessage(message: string, outputFile?: string): string {
  if (!outputFile) return message
  if (message.toLowerCase().includes(outputFile.toLowerCase())) return message
  return `${message} (${outputFile})`
}

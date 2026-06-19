export function createTransactionKey(descricao: string, data: string, valor: number): string {
  return `${descricao}|${data}|${valor}`
}

export function groupTransactionsByDescription(
  transactions: any[],
  individualClassifications: Map<string, any>
) {
  const groupsMap = new Map<string, any>()

  transactions.forEach((transaction) => {
    const isAlreadyGrouped = transaction.datas?.length > 0 && transaction.valores?.length > 0
    const descricao = transaction.descricao
    const tipo = transaction.tipoValor
    const groupKey = tipo ? `${descricao}_${tipo}` : descricao

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        descricao,
        tipo: tipo || 'MISTO',
        transacoes: [],
        transacoesDetalhadas: [],
        total: 0,
        codigoDebito: transaction.codigoDebito || '',
        codigoCredito: transaction.codigoCredito || '',
        debitoError: transaction.debitoError || '',
        creditoError: transaction.creditoError || '',
        debitoLocked: transaction.debitoLocked || false,
        creditoLocked: transaction.creditoLocked || false,
        classificada: transaction.classificada || false,
        expanded: false,
        codigosDebito: transaction.codigosDebito || [],
        codigosCredito: transaction.codigosCredito || [],
        codigosBanco: transaction.codigosBanco || [],
        dividido: !!tipo
      })
    }

    const group = groupsMap.get(groupKey)

    if (isAlreadyGrouped) {
      transaction.datas.forEach((data: string, index: number) => {
        const valor = transaction.valores[index]
        group.transacoes.push({ data, valor })

        const transKey = createTransactionKey(descricao, data, valor)
        const hasIndividual = individualClassifications.has(transKey)
        const individualData = individualClassifications.get(transKey)

        group.transacoesDetalhadas.push({
          descricao,
          data,
          valor,
          transactionKey: transKey,
          hasIndividualClassification: hasIndividual,
          isClassificacaoIndividual: hasIndividual,
          codigoDebito: individualData?.codigoDebito || transaction.codigosDebito?.[index] || '',
          codigoCredito: individualData?.codigoCredito || transaction.codigosCredito?.[index] || '',
          codigoBanco: transaction.codigosBanco?.[0] || '',
          tipo
        })

        group.total += valor
      })
    } else {
      group.transacoes.push({
        data: transaction.data,
        valor: transaction.valor
      })

      const transKey = createTransactionKey(descricao, transaction.data, transaction.valor)
      const hasIndividual = individualClassifications.has(transKey)
      const individualData = individualClassifications.get(transKey)

      group.transacoesDetalhadas.push({
        descricao,
        data: transaction.data,
        valor: transaction.valor,
        transactionKey: transKey,
        hasIndividualClassification: hasIndividual,
        isClassificacaoIndividual: hasIndividual,
        codigoDebito: individualData?.codigoDebito || transaction.codigoDebito || '',
        codigoCredito: individualData?.codigoCredito || transaction.codigoCredito || '',
        codigoBanco: transaction.codigoBanco || '',
        tipo
      })

      group.total += transaction.valor
    }
  })

  return Array.from(groupsMap.values())
}

export function isValidFileType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'application/x-ofx',
    'text/xml',
    'application/xml'
  ]
  const validExtensions = ['.pdf', '.ofx']
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  return validTypes.includes(file.type) || validExtensions.includes(extension)
}

export function getFileTypeLabel(file: File): string {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return 'PDF'
  }
  if (
    file.type === 'application/x-ofx' ||
    file.name.toLowerCase().endsWith('.ofx') ||
    file.type.includes('xml') ||
    file.name.toLowerCase().endsWith('.xml')
  ) {
    return 'OFX'
  }
  return ''
}

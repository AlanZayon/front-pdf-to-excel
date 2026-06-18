import { watch, type Ref } from 'vue'

const STORAGE_PREFIX = 'fiscal2csv:classification:'

export function useClassificationDraft(
  storageKey: Ref<string>,
  groupedTransactions: Ref<any[]>,
  individualClassifications: Ref<Map<string, any>>
) {
  const saveDraft = () => {
    if (!storageKey.value || groupedTransactions.value.length === 0) return

    sessionStorage.setItem(
      `${STORAGE_PREFIX}${storageKey.value}`,
      JSON.stringify({
        groupedTransactions: groupedTransactions.value,
        individualClassifications: Array.from(individualClassifications.value.entries()),
        savedAt: Date.now(),
      })
    )
  }

  const restoreDraft = (): boolean => {
    if (!storageKey.value) return false

    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${storageKey.value}`)
    if (!raw) return false

    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed.groupedTransactions) || parsed.groupedTransactions.length === 0) {
        return false
      }

      groupedTransactions.value = parsed.groupedTransactions
      individualClassifications.value = new Map(parsed.individualClassifications ?? [])
      return true
    } catch {
      return false
    }
  }

  const clearDraft = () => {
    if (!storageKey.value) return
    sessionStorage.removeItem(`${STORAGE_PREFIX}${storageKey.value}`)
  }

  watch([groupedTransactions, individualClassifications], saveDraft, { deep: true })

  return { saveDraft, restoreDraft, clearDraft }
}

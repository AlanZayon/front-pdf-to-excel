import { watch, type Ref } from 'vue'

const STORAGE_PREFIX = 'fiscal2csv:classification:'
const MAX_DRAFTS = 3
const SAVE_DEBOUNCE_MS = 400

type GroupClassificationPatch = {
  descricao: string
  codigoDebito: string
  codigoCredito: string
}

type ClassificationDraftPayload = {
  version: 2
  savedAt: number
  groupClassifications: GroupClassificationPatch[]
  individualClassifications: [string, unknown][]
}

type LegacyDraftPayload = {
  groupedTransactions?: unknown[]
  individualClassifications?: [string, unknown][]
}

function fullStorageKey(storageKey: string) {
  return `${STORAGE_PREFIX}${storageKey}`
}

function listDraftEntries(): Array<{ storageKey: string; savedAt: number }> {
  const entries: Array<{ storageKey: string; savedAt: number }> = []

  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index)
    if (!key?.startsWith(STORAGE_PREFIX)) continue

    const storageKey = key.slice(STORAGE_PREFIX.length)
    let savedAt = 0

    try {
      const raw = sessionStorage.getItem(key)
      const parsed = raw ? (JSON.parse(raw) as ClassificationDraftPayload | LegacyDraftPayload) : null
      savedAt = parsed && 'savedAt' in parsed && typeof parsed.savedAt === 'number' ? parsed.savedAt : 0
    } catch {
      savedAt = 0
    }

    entries.push({ storageKey, savedAt })
  }

  return entries
}

function purgeOldDrafts(keepStorageKey?: string) {
  while (true) {
    const entries = listDraftEntries().sort((a, b) => a.savedAt - b.savedAt)
    if (entries.length <= MAX_DRAFTS) return

    const removable = entries.find((entry) => entry.storageKey !== keepStorageKey)
    if (!removable) return

    sessionStorage.removeItem(fullStorageKey(removable.storageKey))
  }
}

function applyDraftPatches(
  groupedTransactions: unknown[],
  individualClassifications: Ref<Map<string, unknown>>,
  draft: ClassificationDraftPayload
) {
  const patches = new Map(draft.groupClassifications.map((group) => [group.descricao, group]))

  for (const group of groupedTransactions as Array<Record<string, unknown>>) {
    const patch = patches.get(String(group.descricao ?? ''))
    if (!patch) continue
    group.codigoDebito = patch.codigoDebito
    group.codigoCredito = patch.codigoCredito
  }

  individualClassifications.value = new Map(draft.individualClassifications ?? [])
}

export function useClassificationDraft(
  storageKey: Ref<string>,
  groupedTransactions: Ref<any[]>,
  individualClassifications: Ref<Map<string, any>>
) {
  let saveTimer: ReturnType<typeof setTimeout> | undefined

  const buildDraftPayload = (): ClassificationDraftPayload => ({
    version: 2,
    savedAt: Date.now(),
    groupClassifications: groupedTransactions.value.map((group) => ({
      descricao: String(group.descricao ?? ''),
      codigoDebito: String(group.codigoDebito ?? ''),
      codigoCredito: String(group.codigoCredito ?? ''),
    })),
    individualClassifications: Array.from(individualClassifications.value.entries()),
  })

  const saveDraft = () => {
    if (!storageKey.value || groupedTransactions.value.length === 0) return

    purgeOldDrafts(storageKey.value)

    const payload = buildDraftPayload()
    const serialized = JSON.stringify(payload)

    try {
      sessionStorage.setItem(fullStorageKey(storageKey.value), serialized)
    } catch (error) {
      if (!isQuotaExceededError(error)) throw error

      purgeOldDrafts()
      try {
        sessionStorage.setItem(fullStorageKey(storageKey.value), serialized)
      } catch (retryError) {
        if (!isQuotaExceededError(retryError)) throw retryError
      }
    }
  }

  const scheduleSaveDraft = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveTimer = undefined
      saveDraft()
    }, SAVE_DEBOUNCE_MS)
  }

  const restoreDraft = (): boolean => {
    if (!storageKey.value) return false

    const raw = sessionStorage.getItem(fullStorageKey(storageKey.value))
    if (!raw) return false

    try {
      const parsed = JSON.parse(raw) as ClassificationDraftPayload | LegacyDraftPayload

      if (parsed && 'version' in parsed && parsed.version === 2) {
        if (groupedTransactions.value.length === 0) return false
        applyDraftPatches(groupedTransactions.value, individualClassifications, parsed)
        return true
      }

      if (isLegacyDraftPayload(parsed)) {
        if (groupedTransactions.value.length === 0) {
          groupedTransactions.value = parsed.groupedTransactions as any[]
          individualClassifications.value = new Map(parsed.individualClassifications ?? [])
          return true
        }
      }

      return false
    } catch {
      return false
    }
  }

  const clearDraft = () => {
    if (!storageKey.value) return
    sessionStorage.removeItem(fullStorageKey(storageKey.value))
  }

  watch(
    [groupedTransactions, individualClassifications, storageKey],
    () => {
      scheduleSaveDraft()
    },
    { deep: true }
  )

  return { saveDraft, restoreDraft, clearDraft }
}

function isLegacyDraftPayload(
  payload: ClassificationDraftPayload | LegacyDraftPayload
): payload is LegacyDraftPayload & { groupedTransactions: unknown[] } {
  return (
    'groupedTransactions' in payload &&
    Array.isArray(payload.groupedTransactions) &&
    payload.groupedTransactions.length > 0
  )
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014)
  )
}

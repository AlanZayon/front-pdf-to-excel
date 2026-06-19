import { ref } from 'vue'

export type ConfirmDialogState = {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  resolve: ((value: boolean) => void) | null
}

const dialogState = ref<ConfirmDialogState>({
  visible: false,
  title: '',
  message: '',
  confirmLabel: 'Descartar',
  cancelLabel: 'Continuar editando',
  resolve: null,
})

export function useUnsavedWorkGuard() {
  function confirmAction(options: {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
  }): Promise<boolean> {
    return new Promise((resolve) => {
      dialogState.value = {
        visible: true,
        title: options.title ?? 'Descartar alterações?',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Descartar',
        cancelLabel: options.cancelLabel ?? 'Continuar editando',
        resolve,
      }
    })
  }

  function resolveConfirm(confirmed: boolean) {
    const resolve = dialogState.value.resolve
    dialogState.value = { ...dialogState.value, visible: false, resolve: null }
    resolve?.(confirmed)
  }

  return { dialogState, confirmAction, resolveConfirm }
}

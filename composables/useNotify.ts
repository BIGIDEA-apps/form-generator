export interface NotifyItem {
  id: string
  message: string
}

const notifications = ref<NotifyItem[]>([])
const DISMISS_MS = 3500

export function useNotify() {
  function notify(message: string) {
    const id = `notify-${Date.now()}-${Math.random().toString(36).slice(2)}`
    notifications.value = [...notifications.value, { id, message }]

    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, DISMISS_MS)
  }

  function dismiss(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications: readonly(notifications),
    notify,
    dismiss,
  }
}

import { ref } from 'vue'

const notifications = ref<Array<{
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}>>([])

let idCounter = 0

export function triggerGlobalNotification(code: string, message: string) {
  const type = code.includes('ERROR') || code.includes('NOT_FOUND') || code.includes('EXHAUSTED')
    ? 'error'
    : code.includes('WARNING')
      ? 'warning'
      : 'info'

  notifications.value.push({
    id: ++idCounter,
    type,
    title: code,
    message
  })

  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== idCounter)
  }, 5000)
}

export function useNotifications() {
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    notifications.value.push({
      id: ++idCounter,
      type,
      title,
      message
    })

    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== idCounter)
    }, 5000)
  }

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}

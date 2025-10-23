export default defineNuxtPlugin(() => {
  const askNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications non supportées.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification('Notifications activées ! 🎉')
    }
  }

  return { provide: { askNotificationPermission } }
})

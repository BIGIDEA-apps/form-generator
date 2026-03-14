interface PickedSpreadsheet {
  id: string
  name: string
  url: string
}

interface PickedFolder {
  id: string
  name: string
}

let gapiLoadPromise: Promise<void> | null = null

function loadGapiScript(): Promise<void> {
  if (gapiLoadPromise) return gapiLoadPromise

  gapiLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR not supported'))
    if ((window as any).google?.picker) return resolve()

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      ;(window as any).gapi.load('picker', { callback: resolve, onerror: reject })
    }
    script.onerror = () => reject(new Error('Failed to load Google API script'))
    document.head.appendChild(script)
  })

  return gapiLoadPromise
}

async function fetchAccessToken(): Promise<string> {
  const { accessToken } = await $fetch<{ accessToken: string }>('/api/auth/google-token')
  return accessToken
}

export function useGooglePicker() {
  const config = useRuntimeConfig()
  const apiKey = config.public.googleApiKey as string
  const appId = config.public.googlePickerAppId as string

  const isLoading = ref(false)

  async function pickSpreadsheet(): Promise<PickedSpreadsheet | null> {
    isLoading.value = true
    try {
      await loadGapiScript()
      const token = await fetchAccessToken()

      return await new Promise<PickedSpreadsheet | null>((resolve) => {
        const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(false)

        const picker = new google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(token)
          .setDeveloperKey(apiKey)
          .setAppId(appId)
          .setCallback((data: any) => {
            if (data.action === google.picker.Action.PICKED) {
              const doc = data.docs[0]
              resolve({
                id: doc.id,
                name: doc.name,
                url: doc.url,
              })
            }
            else if (data.action === google.picker.Action.CANCEL) {
              resolve(null)
            }
          })
          .build()

        picker.setVisible(true)
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function pickFolder(): Promise<PickedFolder | null> {
    isLoading.value = true
    try {
      await loadGapiScript()
      const token = await fetchAccessToken()

      return await new Promise<PickedFolder | null>((resolve) => {
        const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true)
          .setMimeTypes('application/vnd.google-apps.folder')

        const picker = new google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(token)
          .setDeveloperKey(apiKey)
          .setAppId(appId)
          .setTitle('בחר תיקייה')
          .setCallback((data: any) => {
            if (data.action === google.picker.Action.PICKED) {
              const doc = data.docs[0]
              resolve({
                id: doc.id,
                name: doc.name,
              })
            }
            else if (data.action === google.picker.Action.CANCEL) {
              resolve(null)
            }
          })
          .build()

        picker.setVisible(true)
      })
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    pickSpreadsheet,
    pickFolder,
    isLoading,
  }
}

declare namespace google.picker {
  enum ViewId {
    SPREADSHEETS = 'spreadsheets',
    FOLDERS = 'folders',
  }

  enum Action {
    PICKED = 'picked',
    CANCEL = 'cancel',
  }

  class DocsView {
    constructor(viewId?: ViewId)
    setIncludeFolders(include: boolean): this
    setSelectFolderEnabled(enabled: boolean): this
    setMimeTypes(mimeTypes: string): this
  }

  class PickerBuilder {
    addView(view: DocsView): this
    setOAuthToken(token: string): this
    setDeveloperKey(key: string): this
    setAppId(appId: string): this
    setTitle(title: string): this
    setCallback(callback: (data: any) => void): this
    build(): Picker
  }

  class Picker {
    setVisible(visible: boolean): void
  }
}

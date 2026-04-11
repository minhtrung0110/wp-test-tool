import Store from 'electron-store'

export const store = new Store({
  defaults: {
    theme: 'system',
    lastUrl: 'https://google.com'
  }
})

export function getStoreValue(key: string) {
  return store.get(key)
}

export function setStoreValue(key: string, value: any) {
  store.set(key, value)
}

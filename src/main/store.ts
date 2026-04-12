import Store from 'electron-store'

export const store = new Store({
  defaults: {
    domain: '',
    pages: [],
    categories: ['General'],
    testState: {},
    notes: {},
    theme: null,
  }
})

export function getStoreValue(key: string) {
  return store.get(key)
}

export function setStoreValue(key: string, value: unknown) {
  store.set(key, value)
}

import { create } from 'zustand'

export interface Page {
  id: string
  title: string
  slug: string
  category: string
}

export type TestStatus = 'untested' | 'tested' | 'error'
export type Viewport = 'desktop' | 'tablet' | 'mobile'
export type HttpStatus = number | 'error' | 'checking' | null

interface AppState {
  // Domain
  domain: string
  setDomain: (d: string) => void

  // Pages
  pages: Page[]
  setPages: (p: Page[]) => void
  addPage: (p: Omit<Page, 'id'>) => void
  updatePage: (id: string, u: Partial<Omit<Page, 'id'>>) => void
  deletePage: (id: string) => void

  // Categories
  categories: string[]
  setCategories: (c: string[]) => void
  addCategory: (name: string) => void
  deleteCategory: (name: string) => void

  // Active page
  activePageId: string | null
  setActivePageId: (id: string | null) => void

  // Webview state
  currentUrl: string
  setCurrentUrl: (url: string) => void
  webviewLoading: boolean
  setWebviewLoading: (v: boolean) => void
  webviewTitle: string
  setWebviewTitle: (t: string) => void
  canGoBack: boolean
  canGoForward: boolean
  setCanGoBack: (v: boolean) => void
  setCanGoForward: (v: boolean) => void

  // Test state
  testState: Record<string, TestStatus>
  setTestStatus: (id: string, status: TestStatus) => void
  resetAll: () => void

  // Notes per page
  notes: Record<string, string>
  setNote: (id: string, note: string) => void

  // HTTP status per page
  httpStatus: Record<string, HttpStatus>
  setHttpStatus: (id: string, s: HttpStatus) => void
  clearHttpStatus: () => void

  // Viewport mode
  viewport: Viewport
  setViewport: (v: Viewport) => void

  // Category filter
  categoryFilter: string | null
  setCategoryFilter: (c: string | null) => void

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (t: 'light' | 'dark' | 'system') => void

  // Page modal (add / edit)
  pageModalOpen: boolean
  pageModalEditId: string | null
  openAddModal: () => void
  openEditModal: (id: string) => void
  closePageModal: () => void

  // Category modal
  categoryModalOpen: boolean
  openCategoryModal: () => void
  closeCategoryModal: () => void

  // Screenshots loaded for active page
  screenshots: string[]
  setScreenshots: (s: string[]) => void

  // Bottom panel tab
  bottomTab: 'notes' | 'screenshots'
  setBottomTab: (t: 'notes' | 'screenshots') => void

  // Tracks whether any confirm/alert dialog is open (for WebContentsView hiding)
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  domain: '',
  setDomain: (domain) => set({ domain }),

  pages: [],
  setPages: (pages) => set({ pages }),
  addPage: (p) =>
    set((s) => ({ pages: [...s.pages, { ...p, id: crypto.randomUUID() }] })),
  updatePage: (id, u) =>
    set((s) => ({ pages: s.pages.map((p) => (p.id === id ? { ...p, ...u } : p)) })),
  deletePage: (id) =>
    set((s) => {
      const { [id]: _ts, ...testState } = s.testState
      const { [id]: _n, ...notes } = s.notes
      const { [id]: _h, ...httpStatus } = s.httpStatus
      return {
        pages: s.pages.filter((p) => p.id !== id),
        testState,
        notes,
        httpStatus,
        activePageId: s.activePageId === id ? null : s.activePageId,
      }
    }),

  categories: ['General'],
  setCategories: (categories) => set({ categories }),
  addCategory: (name) =>
    set((s) => ({
      categories: s.categories.includes(name) ? s.categories : [...s.categories, name],
    })),
  deleteCategory: (name) =>
    set((s) => ({
      categories: s.categories.filter((c) => c !== name),
      pages: s.pages.map((p) => (p.category === name ? { ...p, category: 'General' } : p)),
    })),

  activePageId: null,
  setActivePageId: (activePageId) => set({ activePageId }),

  currentUrl: '',
  setCurrentUrl: (currentUrl) => set({ currentUrl }),
  webviewLoading: false,
  setWebviewLoading: (webviewLoading) => set({ webviewLoading }),
  webviewTitle: '',
  setWebviewTitle: (webviewTitle) => set({ webviewTitle }),
  canGoBack: false,
  canGoForward: false,
  setCanGoBack: (canGoBack) => set({ canGoBack }),
  setCanGoForward: (canGoForward) => set({ canGoForward }),

  testState: {},
  setTestStatus: (id, status) =>
    set((s) => ({ testState: { ...s.testState, [id]: status } })),
  resetAll: () =>
    set({ testState: {}, notes: {}, httpStatus: {}, activePageId: null, currentUrl: '' }),

  notes: {},
  setNote: (id, note) => set((s) => ({ notes: { ...s.notes, [id]: note } })),

  httpStatus: {},
  setHttpStatus: (id, status) =>
    set((s) => ({ httpStatus: { ...s.httpStatus, [id]: status } })),
  clearHttpStatus: () => set({ httpStatus: {} }),

  viewport: 'desktop',
  setViewport: (viewport) => set({ viewport }),

  categoryFilter: null,
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  theme: 'system',
  setTheme: (theme) => set({ theme }),

  pageModalOpen: false,
  pageModalEditId: null,
  openAddModal: () => set({ pageModalOpen: true, pageModalEditId: null }),
  openEditModal: (id) => set({ pageModalOpen: true, pageModalEditId: id }),
  closePageModal: () => set({ pageModalOpen: false, pageModalEditId: null }),

  categoryModalOpen: false,
  openCategoryModal: () => set({ categoryModalOpen: true }),
  closeCategoryModal: () => set({ categoryModalOpen: false }),

  screenshots: [],
  setScreenshots: (screenshots) => set({ screenshots }),

  bottomTab: 'notes',
  setBottomTab: (bottomTab) => set({ bottomTab }),

  dialogOpen: false,
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
}))

import { create } from 'zustand'

const CACHE_PREFIX = 'vibemap-map-'

function loadCachedMap(repoFullName) {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + repoFullName)
    return cached ? JSON.parse(cached) : null
  } catch { return null }
}

function saveMapToCache(repoFullName, map) {
  try {
    localStorage.setItem(CACHE_PREFIX + repoFullName, JSON.stringify(map))
  } catch {}
}

export const useRepoStore = create((set, get) => ({
  selectedRepo: null,
  fileTree: null,
  openFile: null,
  fileContent: null,
  semanticMap: null,

  // Loading states
  loadingTree: false,
  loadingFile: false,
  loadingMap: false,

  setRepo: (repo) => {
    // Load cached map for this repo
    const cachedMap = repo ? loadCachedMap(repo.full_name) : null
    set({
      selectedRepo: repo,
      fileTree: null,
      openFile: null,
      fileContent: null,
      semanticMap: cachedMap,
    })
  },

  setFileTree: (tree) => set({ fileTree: tree }),

  setOpenFile: (file) => set({ openFile: file, fileContent: null }),
  setFileContent: (content) => set({ fileContent: content }),

  setSemanticMap: (map) => {
    const { selectedRepo } = get()
    if (selectedRepo) saveMapToCache(selectedRepo.full_name, map)
    set({ semanticMap: map })
  },

  setLoading: (key, value) => set({ [key]: value }),

  clearRepo: () => set({
    selectedRepo: null,
    fileTree: null,
    openFile: null,
    fileContent: null,
    semanticMap: null,
  }),
}))

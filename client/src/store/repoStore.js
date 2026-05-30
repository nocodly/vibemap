import { create } from 'zustand'

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

  setRepo: (repo) => set({
    selectedRepo: repo,
    fileTree: null,
    openFile: null,
    fileContent: null,
    semanticMap: null,
  }),

  setFileTree: (tree) => set({ fileTree: tree }),

  setOpenFile: (file) => set({ openFile: file, fileContent: null }),
  setFileContent: (content) => set({ fileContent: content }),

  setSemanticMap: (map) => set({ semanticMap: map }),

  setLoading: (key, value) => set({ [key]: value }),

  clearRepo: () => set({
    selectedRepo: null,
    fileTree: null,
    openFile: null,
    fileContent: null,
    semanticMap: null,
  }),
}))

import { FileCode, FileText, FileJson, Settings, Image, Package } from 'lucide-react'

const EXT_MAP = {
  // JS / TS
  js: { icon: FileCode, color: '#f7df1e' },
  jsx: { icon: FileCode, color: '#61dafb' },
  ts: { icon: FileCode, color: '#3178c6' },
  tsx: { icon: FileCode, color: '#61dafb' },
  // Styles
  css: { icon: FileCode, color: '#264de4' },
  scss: { icon: FileCode, color: '#c69' },
  // Data
  json: { icon: FileJson, color: '#f0a500' },
  yaml: { icon: Settings, color: '#cc3e44' },
  yml: { icon: Settings, color: '#cc3e44' },
  toml: { icon: Settings, color: '#9c4121' },
  env: { icon: Settings, color: '#4CAF50' },
  // Docs
  md: { icon: FileText, color: '#083fa1' },
  mdx: { icon: FileText, color: '#083fa1' },
  txt: { icon: FileText, color: '#888' },
  // Python
  py: { icon: FileCode, color: '#3776ab' },
  // Go
  go: { icon: FileCode, color: '#00add8' },
  // Rust
  rs: { icon: FileCode, color: '#ce422b' },
  // Ruby
  rb: { icon: FileCode, color: '#cc0000' },
  // PHP
  php: { icon: FileCode, color: '#777bb4' },
  // HTML
  html: { icon: FileCode, color: '#e44d26' },
  // Package files
  lock: { icon: Package, color: '#666' },
}

const NAME_MAP = {
  'package.json': { icon: Package, color: '#cb3837' },
  'dockerfile': { icon: Settings, color: '#2496ed' },
  '.gitignore': { icon: Settings, color: '#f05032' },
  '.env': { icon: Settings, color: '#4CAF50' },
  '.env.example': { icon: Settings, color: '#4CAF50' },
}

export default function FileIcon({ filename, size = 12 }) {
  const lower = filename.toLowerCase()
  const ext = lower.split('.').pop()

  const config = NAME_MAP[lower] || EXT_MAP[ext] || { icon: FileText, color: '#888' }
  const Icon = config.icon

  return <Icon size={size} style={{ color: config.color, flexShrink: 0 }} />
}

import { FolderTree, Map, MessageSquare } from 'lucide-react'

const tabs = [
  { id: 'files', icon: FolderTree, label: 'Files' },
  { id: 'map',   icon: Map,        label: 'Map' },
  { id: 'chat',  icon: MessageSquare, label: 'Chat' },
]

export default function MobileNav({ active, onChange }) {
  return (
    <nav className="md:hidden flex-shrink-0 border-t border-[#222] bg-[#111] flex items-center safe-area-bottom">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            active === tab.id
              ? 'text-violet-400'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          <tab.icon size={18} strokeWidth={active === tab.id ? 2 : 1.5} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

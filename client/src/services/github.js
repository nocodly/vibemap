const BASE = 'https://api.github.com'

// Extensions to skip — binaries, lock files, generated files
const SKIP_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'avif',
  'pdf', 'zip', 'tar', 'gz', 'rar',
  'woff', 'woff2', 'ttf', 'eot',
  'mp4', 'mp3', 'wav', 'ogg',
  'lock', 'sum',
])

const SKIP_NAMES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.DS_Store', 'Thumbs.db',
])

function shouldSkip(name) {
  if (SKIP_NAMES.has(name)) return true
  const ext = name.split('.').pop()?.toLowerCase()
  return SKIP_EXTENSIONS.has(ext)
}

async function ghFetch(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API error ${res.status}`)
  }

  return res.json()
}

// Get authenticated user
export async function getUser(token) {
  return ghFetch('/user', token)
}

// List user repos — sorted by recent push
export async function listRepos(token, page = 1) {
  return ghFetch(
    `/user/repos?sort=pushed&per_page=50&page=${page}&affiliation=owner,collaborator`,
    token
  )
}

// Get file tree of a repo (recursive, flat list)
export async function getFileTree(token, owner, repo, branch = 'HEAD') {
  const data = await ghFetch(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token
  )

  // Filter out binaries and build artifacts
  const files = data.tree.filter(
    (item) => item.type === 'blob' && !shouldSkip(item.path.split('/').pop())
  )

  return buildTree(files)
}

// Get file content (decoded from base64)
export async function getFileContent(token, owner, repo, path) {
  const data = await ghFetch(
    `/repos/${owner}/${repo}/contents/${path}`,
    token
  )

  if (data.encoding === 'base64') {
    return atob(data.content.replace(/\n/g, ''))
  }

  return data.content
}

// Get repo default branch
export async function getRepoBranch(token, owner, repo) {
  const data = await ghFetch(`/repos/${owner}/${repo}`, token)
  return data.default_branch
}

// Build nested tree from flat GitHub tree list
function buildTree(flatFiles) {
  const root = { name: '', children: {}, type: 'dir' }

  for (const file of flatFiles) {
    const parts = file.path.split('/')
    let node = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1

      if (!node.children[part]) {
        node.children[part] = isLast
          ? { name: part, path: file.path, type: 'file', sha: file.sha, size: file.size }
          : { name: part, children: {}, type: 'dir' }
      }

      if (!isLast) node = node.children[part]
    }
  }

  return sortTree(root)
}

// Sort: dirs first, then files, alphabetically
function sortTree(node) {
  if (node.type === 'file') return node

  const sorted = {}
  const entries = Object.entries(node.children)

  entries.sort(([, a], [, b]) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  for (const [key, child] of entries) {
    sorted[key] = sortTree(child)
  }

  return { ...node, children: sorted }
}

// Builds the engineering assistant system prompt with repo context
export function buildSystemPrompt({ repo, fileTreeText, semanticMap, currentFile }) {
  const blocks = semanticMap?.blocks
    ?.map((b) => `  • ${b.name} — ${b.description}`)
    .join('\n') || '  Not analyzed yet'

  const fileContext = currentFile
    ? `\n## Currently Viewed File\nPath: \`${currentFile.path}\`\n\`\`\`${currentFile.language || ''}\n${currentFile.content?.slice(0, 6000) || ''}\n\`\`\``
    : ''

  return `You are a senior software engineer embedded inside Vibemap, an AI-powered code explorer.
You are the engineering assistant for the project "${repo.full_name}".

## Your Role
- Help the developer understand their codebase deeply and precisely
- Explain what files, functions, classes, and patterns do
- Answer questions about architecture, data flow, and dependencies
- Reference actual file names, function names, and line numbers from the codebase
- Be concise but complete — no fluff, no generic advice
- Never make up code that doesn't exist in this project

## Project Info
- Name: ${repo.full_name}
- Language: ${repo.language || 'Unknown'}
- Description: ${repo.description || 'No description'}
- Stars: ${repo.stargazers_count || 0}

## Semantic Structure
${blocks}

## File Tree (top-level)
\`\`\`
${fileTreeText?.slice(0, 3000) || 'Not loaded'}
\`\`\`
${fileContext}

Respond in the same language the user writes in. Be direct and precise.`
}

// Prompt to analyze a single file
export function buildFileAnalysisPrompt(filePath, content) {
  return `Analyze this file from the codebase: \`${filePath}\`

\`\`\`
${content.slice(0, 8000)}
\`\`\`

Provide:
1. **What this file does** (1-2 sentences)
2. **Key exports / functions / classes** (list the most important ones with brief descriptions)
3. **Dependencies** (what this file depends on and what depends on it, if obvious)
4. **Important patterns** (any notable patterns, gotchas, or design decisions)

Be specific to this exact code, not generic.`
}

// Prompt to build semantic map from file tree
export function buildSemanticMapPrompt(fileTreeText, repoName) {
  return `You are a JSON API. Respond with ONLY a JSON object, nothing else. No markdown, no explanation, no code fences.

Analyze these files from the project "${repoName}" and group them into 4-8 logical blocks.

Files:
${fileTreeText.slice(0, 4000)}

Respond with this exact JSON structure (replace values with real data):
{"blocks":[{"name":"Block Name","color":"api","description":"One sentence description","files":["exact/file/path.js"],"icon":"emoji"}]}

Color options: auth, db, api, ui, config, util, payment, test
Use only files from the list above. Start your response with { and end with }`
}

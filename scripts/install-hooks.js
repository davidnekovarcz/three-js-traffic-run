#!/usr/bin/env node
/**
 * Install Git hooks for automatic documentation sync
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const gitHooksDir = path.join(projectRoot, '.git', 'hooks')

const preCommitHook = `#!/bin/sh
# Auto-sync documentation before commit
echo "🔄 Syncing documentation..."
npm run sync-docs

# Add updated docs to commit if they changed
git add README.md claude.md

echo "✅ Documentation synced and added to commit"
`

async function installHooks() {
  try {
    // Check if .git directory exists
    const gitDir = path.join(projectRoot, '.git')
    try {
      await fs.access(gitDir)
    } catch {
      console.log('ℹ️  Not a git repository, skipping hook installation')
      return
    }

    // Ensure hooks directory exists
    await fs.mkdir(gitHooksDir, { recursive: true })

    // Install pre-commit hook
    const preCommitPath = path.join(gitHooksDir, 'pre-commit')
    await fs.writeFile(preCommitPath, preCommitHook)
    await fs.chmod(preCommitPath, 0o755)

    console.log('✅ Git hooks installed successfully!')
    console.log('📝 Documentation will auto-sync on every commit')

  } catch (error) {
    console.error('❌ Error installing Git hooks:', error)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  installHooks()
}

export { installHooks }
#!/usr/bin/env node

import { watch, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { main } from './update-todos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Go up 3 levels: scripts -> _ -> src -> project root
const projectRoot = join(__dirname, '..', '..', '..');

let debounceTimer = null;
const DEBOUNCE_MS = 500; // Wait 500ms after last change before updating

function debouncedUpdate() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    console.log('\n📝 File change detected, updating TODOs...');
    main();
  }, DEBOUNCE_MS);
}

function watchDirectory(dirPath, watchers = []) {
  try {
    const watcher = watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (filename && 
          !filename.toLowerCase().includes('readme.md') && 
          !filename.includes('node_modules') &&
          !filename.includes('.git') &&
          !filename.includes('.eleventy-cache') &&
          !filename.includes('public')) {
        debouncedUpdate();
      }
    });
    
    watchers.push(watcher);
  } catch (error) {
    // fs.watch with recursive may not be available on all systems
    // Fall back to watching specific directories
    try {
      const entries = readdirSync(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        
        try {
          const stats = statSync(fullPath);
          if (stats.isDirectory() && 
              !entry.startsWith('.') && 
              entry !== 'node_modules' && 
              entry !== 'public' && 
              entry !== '.git' &&
              entry !== '.eleventy-cache' &&
              entry !== 'scripts') {
            watchDirectory(fullPath, watchers);
          }
        } catch (error) {
          // Skip entries that can't be accessed
        }
      }
    } catch (readError) {
      console.error(`Error reading ${dirPath}:`, readError.message);
    }
  }
  
  return watchers;
}

console.log('👀 Watching for file changes...');
console.log('Press Ctrl+C to stop\n');

// Initial scan
main();

// Start watching
const watchers = watchDirectory(projectRoot);

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping watch...');
  watchers.forEach(watcher => watcher.close());
  process.exit(0);
});

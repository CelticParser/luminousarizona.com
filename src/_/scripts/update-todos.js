#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Go up 3 levels: scripts -> _ -> src -> project root
const projectRoot = join(__dirname, '..', '..', '..');

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.eleventy-cache',
  'public',
  'package-lock.json',
  'readme.md', // Don't scan the README itself
  'README.md',
  '_/scripts', // Don't scan the scripts directory
  'framework/bootstrap', // Ignore Bootstrap framework files
  'framework/libraries', // Ignore library files (Font Awesome, etc.)
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.md', '.liquid', '.js', '.json', '.yml', '.yaml', '.scss', '.css', '.html', '.txt'];

// Patterns to match TODO comments
const TODO_PATTERNS = [
  /TODO:?\s*(.+)/gi,
  /FIXME:?\s*(.+)/gi,
  /XXX:?\s*(.+)/gi,
  /HACK:?\s*(.+)/gi,
  // Match YAML values that are just "TODO" or start with "TODO"
  /:\s*["']?TODO\s*([^"']*)/gi,
  // Match markdown blockquotes or content with TODO
  />\s*_?TODO_?/gi,
  /^\s*_?TODO_?\s*$/gim,
  // Match YAML key-value pairs where value is "TODO"
  /subTitle:\s*["']TODO["']/gi,
];

function shouldIgnore(path) {
  const relativePath = relative(projectRoot, path);
  return IGNORE_PATTERNS.some(pattern => 
    relativePath.includes(pattern) || 
    relativePath.startsWith(pattern)
  );
}

function shouldScanFile(filePath) {
  if (shouldIgnore(filePath)) return false;
  
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  return SCAN_EXTENSIONS.includes(ext.toLowerCase());
}

function findTodos(filePath) {
  const todos = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      TODO_PATTERNS.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          let todoText = match[1]?.trim() || match[0];
          
          // Special handling for subTitle: "TODO" pattern (YAML frontmatter)
          if (match[0].includes('subTitle:') && match[0].includes('TODO') && !match[0].includes('<!--')) {
            todoText = 'Create a subtitle';
          } else {
            // Clean up the text - remove quotes, colons, etc.
            todoText = todoText.replace(/^["']|["']$/g, '').replace(/^:\s*/, '').replace(/^>\s*/, '').replace(/^_|_$/g, '').trim();
          }
          
          // Filter out false positives
          const falsePositives = [
            /^G-/, // Google Analytics IDs
            /^GTM-/, // Google Tag Manager IDs
            /^\+61/, // Phone numbers
            /hacker-news/i, // Font Awesome icon names
            /hackerrank/i, // Font Awesome icon names
            /mastodon/i, // Font Awesome icon names
            /Todo in v6/i, // Bootstrap v6 migration notes
            /can be removed safely/i, // Framework cleanup notes
            /^[\s"]*$/, // Empty or whitespace-only
            /^s":/, // JSON property fragments
            /^XXXX/, // Placeholder text
            /^"TODO$/, // Incomplete quote
          ];
          
          const isFalsePositive = falsePositives.some(fp => fp.test(todoText));
          
          // For standalone "TODO" or empty after cleanup, use a default message
          if (!todoText || todoText === 'TODO' || todoText === '_TODO_' || todoText === '"TODO') {
            todoText = 'TODO - Action needed';
          }
          
          // Only include if it has meaningful content
          const hasMeaningfulContent = todoText.length >= 3;
          
          if (todoText && !isFalsePositive && hasMeaningfulContent) {
            todos.push({
              line: index + 1,
              text: todoText,
              file: relative(projectRoot, filePath),
            });
          }
        });
      });
    });
  } catch (error) {
    // Skip files that can't be read
  }
  
  return todos;
}

function scanDirectory(dirPath) {
  const todos = [];
  
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      
      if (shouldIgnore(fullPath)) continue;
      
      try {
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          todos.push(...scanDirectory(fullPath));
        } else if (stats.isFile() && shouldScanFile(fullPath)) {
          todos.push(...findTodos(fullPath));
        }
      } catch (error) {
        // Skip entries that can't be accessed
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return todos;
}

function formatTodos(todos) {
  if (todos.length === 0) {
    return '## TODO\n\nNo pending TODOs found.\n';
  }
  
  // Remove duplicates (same file, line, and text)
  const seen = new Set();
  const uniqueTodos = todos.filter(todo => {
    const key = `${todo.file}:${todo.line}:${todo.text}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  
  // Group by file
  const grouped = {};
  uniqueTodos.forEach(todo => {
    if (!grouped[todo.file]) {
      grouped[todo.file] = [];
    }
    grouped[todo.file].push(todo);
  });
  
  // Sort files alphabetically
  const sortedFiles = Object.keys(grouped).sort();
  
  let output = '## TODO\n\n';
  output += 'This section is automatically generated by scanning the codebase for TODO comments.\n\n';
  
  sortedFiles.forEach(file => {
    output += `### \`${file}\`\n\n`;
    grouped[file].forEach(todo => {
      output += `- **Line ${todo.line}:** ${todo.text}\n`;
    });
    output += '\n';
  });
  
  return output;
}

function updateReadme(todos) {
  const readmePath = join(projectRoot, 'readme.md');
  let readmeContent = '';
  
  try {
    readmeContent = readFileSync(readmePath, 'utf-8');
  } catch (error) {
    console.error('Error reading README.md:', error);
    return;
  }
  
  // Remove existing TODO section and any preceding separator lines
  // Match: optional separator lines (---) followed by TODO section
  const todoSectionRegex = /(\n---\s*\n)*## TODO[\s\S]*?(?=\n---|\n## |$)/;
  readmeContent = readmeContent.replace(todoSectionRegex, '');
  
  // Remove trailing whitespace and any trailing separators
  readmeContent = readmeContent.trim();
  readmeContent = readmeContent.replace(/\n---\s*$/, '');
  readmeContent = readmeContent.trim();
  
  // Add separator and new TODO section (only one separator)
  const newTodoSection = formatTodos(todos);
  const updatedContent = `${readmeContent}\n\n---\n\n${newTodoSection}`;
  
  try {
    writeFileSync(readmePath, updatedContent, 'utf-8');
    console.log(`✅ Updated README.md with ${todos.length} TODO${todos.length !== 1 ? 's' : ''}`);
  } catch (error) {
    console.error('Error writing README.md:', error);
  }
}

function main() {
  console.log('🔍 Scanning for TODOs...');
  const todos = scanDirectory(projectRoot);
  console.log(`Found ${todos.length} TODO${todos.length !== 1 ? 's' : ''}`);
  updateReadme(todos);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, scanDirectory, updateReadme };

#!/usr/bin/env tsx
/**
 * Audit Service Update Script
 *
 * Updates AuditService.log({...}) to logAuditEntry({...})
 * and AuditService.configureWriter to configureAuditWriter
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'glob';

const files = glob.sync('packages/**/*.ts', {
  cwd: process.cwd(),
});

let _updated = 0;
let _errors = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf-8');

    // Skip if no AuditService references
    if (!content.includes('AuditService')) {
      continue;
    }

    let newContent = content;

    // Replace AuditService.log({ with logAuditEntry({
    newContent = newContent.replace(/AuditService\.log\(/g, 'logAuditEntry(');

    // Replace AuditService.configureWriter with configureAuditWriter
    newContent = newContent.replace(/AuditService\.configureWriter/g, 'configureAuditWriter');

    // Check if file was modified
    if (newContent !== content) {
      writeFileSync(file, newContent);
      _updated++;
    }
  } catch (error) {
    console.error(`❌ Error in ${file}:`, error);
    _errors++;
  }
}

// Same for apps/
const appFiles = glob.sync('apps/**/*.ts', {
  cwd: process.cwd(),
});

for (const file of appFiles) {
  try {
    const content = readFileSync(file, 'utf-8');

    if (!content.includes('AuditService')) {
      continue;
    }

    let newContent = content;
    newContent = newContent.replace(/AuditService\.log\(/g, 'logAuditEntry(');
    newContent = newContent.replace(/AuditService\.configureWriter/g, 'configureAuditWriter');

    if (newContent !== content) {
      writeFileSync(file, newContent);
      _updated++;
    }
  } catch (error) {
    console.error(`❌ Error in ${file}:`, error);
    _errors++;
  }
}

// Same for infra/
const infraFiles = glob.sync('infra/**/*.ts', {
  cwd: process.cwd(),
});

for (const file of infraFiles) {
  try {
    const content = readFileSync(file, 'utf-8');

    if (!content.includes('AuditService')) {
      continue;
    }

    let newContent = content;
    newContent = newContent.replace(/AuditService\.log\(/g, 'logAuditEntry(');
    newContent = newContent.replace(/AuditService\.configureWriter/g, 'configureAuditWriter');

    if (newContent !== content) {
      writeFileSync(file, newContent);
      _updated++;
    }
  } catch (error) {
    console.error(`❌ Error in ${file}:`, error);
    _errors++;
  }
}

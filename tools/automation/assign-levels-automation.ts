#!/usr/bin/env tsx
#
!/usr/bin / env;
tsx;

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import { processFileContent, readFrontmatter, shouldProcessFile } from './internal/level-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

function gatherFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

async function main(options: Options): Promise<void> {
  const repoRoot = path.resolve(process.cwd());
  const agentsDir = path.join(repoRoot, '.github', 'agents');
  const promptsDir = path.join(repoRoot, '.github', 'prompts');

  const files = [...gatherFiles(agentsDir), ...gatherFiles(promptsDir)];
  let changed = 0;

  const level = 'staff';
  const date = new Date().toISOString().slice(0, 10);

  logger.step(`Processing ${files.length} files...`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const frontmatter = readFrontmatter(content);

    if (!shouldProcessFile(frontmatter)) {
      continue;
    }

    const result = processFileContent({ content, filePath: file, level, date });

    if (!result.success) {
      logger.error(`${file}: ${result.error}`);
      continue;
    }

    if (result.data !== content) {
      if (!options.dryRun) {
        fs.writeFileSync(file, result.data, 'utf8');
      }
      changed++;
      logger.info(`Updated: ${file}`);
    }
  }

  logger.success(`Finished. Files updated: ${changed}`);
}

const cli = createCli<Options>({
  name: 'assign-levels-automation',
  version: '2.0.0',
  description: 'Add level and last_reviewed to agent/prompt frontmatter',
  action: main,
});

if (process.argv[1]?.includes('assign-levels-automation')) {
  cli.parse(process.argv);
}

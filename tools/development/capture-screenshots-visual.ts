#!/usr/bin/env tsx
#
!/usr/bin / env;
tsx;

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { createCli, logger } from '../libraries/create-cli.js';
import {
  buildDefaultRoutes,
  buildScreenshotResult,
  validateConfig,
} from './internal/screenshot-logic.js';
import type { ScreenshotResult } from './internal/screenshot-types.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

async function main(options: Options): Promise<void> {
  const outputDir = process.argv[2] || path.join(process.cwd(), 'reports/screenshots');

  const configResult = validateConfig({
    routes: buildDefaultRoutes('http://localhost:3000', 'http://localhost:3002'),
    outputDir,
    viewportWidth: 1440,
    viewportHeight: 900,
    deviceScaleFactor: 2,
    timeoutMs: 15000,
  });

  if (!configResult.success) {
    logger.error(configResult.error);
    process.exit(1);
  }

  const config = configResult.data;

  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  if (options.dryRun) {
    logger.warning('Dry run - no screenshots taken');
    for (const route of config.routes) {
      logger.info(`  Would capture: ${route.url} -> ${route.name}.png`);
    }
    process.exit(0);
  }

  logger.step(`Starting screenshot capture to: ${config.outputDir}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: config.viewportWidth, height: config.viewportHeight },
    deviceScaleFactor: config.deviceScaleFactor,
  });
  const page = await context.newPage();

  const results: ScreenshotResult[] = [];

  for (const route of config.routes) {
    const dest = path.join(config.outputDir, `${route.name}.png`);
    try {
      logger.info(`Capturing ${route.url}...`);
      await page.goto(route.url, { waitUntil: 'networkidle', timeout: config.timeoutMs });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: dest, fullPage: true });
      results.push(buildScreenshotResult(route.name, route.url, dest));
    } catch (err) {
      results.push(buildScreenshotResult(route.name, route.url, dest, err));
    }
  }

  await browser.close();

  if (options.json) {
  } else {
  }
}

const cli = createCli<Options>({
  name: 'capture-screenshots-visual',
  version: '2.0.0',
  description: 'Capture full-page screenshots of major routes',
  action: main,
});

if (process.argv[1]?.includes('capture-screenshots-visual')) {
  cli.parse(process.argv);
}

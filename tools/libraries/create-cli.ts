import { Command } from 'commander';
import kleur from 'kleur';

export interface CliConfig<T extends Record<string, any> = Record<string, any>> {
  name: string;
  version: string;
  description: string;
  action: (options: T) => Promise<void>;
  options?: Array<{
    flags: string;
    description: string;
    defaultValue?: any;
    required?: boolean;
  }>;
}

export function createCli<T extends Record<string, any>>(config: CliConfig<T>): Command {
  const program = new Command();

  program.name(config.name).description(config.description).version(config.version);

  program
    .option('--verbose', 'Enable verbose logging', false)
    .option('--dry-run', 'Run without making changes', false)
    .option('--json', 'Output JSON', false);

  if (config.options) {
    config.options.forEach((opt) => {
      program.option(opt.flags, opt.description, opt.defaultValue);
    });
  }

  program.action(async (options) => {
    try {
      await config.action(options as T);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (options.json) {
        console.error(JSON.stringify({ error: errorMessage }, null, 2));
      } else {
        console.error(kleur.red(`Error: ${errorMessage}`));
      }

      process.exit(1);
    }
  });

  return program;
}

export const logger = {
  success(_message: string): void {},

  error(message: string): void {
    console.error(kleur.red(`✗ ${message}`));
  },

  warning(message: string): void {
    console.warn(kleur.yellow(`⚠ ${message}`));
  },

  info(_message: string): void {},

  step(_message: string): void {},

  json(_data: any): void {},
};

export { Command };

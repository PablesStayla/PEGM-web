#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { createCli, logger } from '../libraries/create-cli.js';
import { buildAdminConfig, maskSecret } from './internal/admin-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

async function createAdminUser(config: {
  email: string;
  password: string;
  supabaseUrl: string;
  serviceRoleKey: string;
}): Promise<{ userId: string; created: boolean }> {
  const supabase = createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', config.email)
    .single();

  if (existing) {
    return { userId: (existing as { id: string }).id, created: false };
  }

  const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
    email: config.email,
    password: config.password,
    email_confirm: true,
    user_metadata: { role: 'admin', full_name: 'setup-admin-credentials' },
  });

  if (signUpError) {
    throw signUpError;
  }
  if (!user.user) {
    throw new Error('Failed to create user');
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      full_name: 'System Administrator',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.user.id);

  if (profileError) {
    throw profileError;
  }

  return { userId: user.user.id, created: true };
}

async function main(options: Options): Promise<void> {
  const configResult = buildAdminConfig(process.env as Record<string, string | undefined>);

  if (!configResult.success) {
    logger.error(configResult.error);
    process.exit(1);
  }

  const config = configResult.data;

  logger.step('Creating admin user...');
  logger.info(`Email: ${config.email}`);

  if (options.dryRun) {
    logger.warning('Dry run - no changes made');
    logger.info(`Password: ${maskSecret(config.password)}`);
    process.exit(0);
  }

  try {
    const result = await createAdminUser(config);

    if (result.created) {
      logger.success('Admin user created successfully');
    } else {
      logger.warning('Admin user already exists');
    }

    logger.info(`Password: [MASKED]`);
  } catch (err) {
    logger.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'setup-admin',
  version: '2.0.0',
  description: 'Create initial admin user for PranaKaia',
  action: main,
});

if (process.argv[1]?.includes('setup-admin-credentials')) {
  cli.parse(process.argv);
}

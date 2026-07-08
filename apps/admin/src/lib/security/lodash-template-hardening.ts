type LodashTemplateOptions = {
  imports?: Record<string, unknown>;
};

type LodashTemplate = (
  source: string,
  options?: LodashTemplateOptions,
  guard?: unknown,
) => (...args: unknown[]) => unknown;

type LodashModule = {
  template?: LodashTemplate;
  templateSettings?: LodashTemplateOptions;
};

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

let isLodashTemplateHardened = false;

function assertSafeImportKeys(imports: Record<string, unknown>): void {
  for (const key of Object.keys(imports)) {
    if (!IDENTIFIER_PATTERN.test(key)) {
      throw new Error('Blocked unsafe lodash template import key');
    }
  }
}

function sanitizeImports(imports: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(imports)) {
    if (IDENTIFIER_PATTERN.test(key)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function hardenLodashTemplateRuntime(): Promise<void> {
  if (isLodashTemplateHardened) {
    return;
  }

  try {
    const moduleName = 'node:module';
    const { createRequire } = await import(moduleName);
    const requireFromHere = createRequire(import.meta.url);
    const lodash = requireFromHere('lodash') as LodashModule;

    if (typeof lodash.template !== 'function') {
      return;
    }

    const originalTemplate = lodash.template.bind(lodash);

    lodash.template = ((source, options, guard) => {
      const imports = options?.imports;

      if (imports) {
        assertSafeImportKeys(imports);
      }

      return originalTemplate(source, options, guard);
    }) as LodashTemplate;

    if (lodash.templateSettings?.imports) {
      lodash.templateSettings.imports = sanitizeImports(lodash.templateSettings.imports);
    }

    isLodashTemplateHardened = true;
  } catch {
    // Do not block startup if lodash is not resolvable in this runtime.
  }
}

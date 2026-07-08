import { z } from 'zod';

export const MCPConfigSchema = z.object({
  servers: z
    .record(
      z.string(),
      z
        .object({
          command: z.string().optional(),
          args: z.array(z.string()).optional(),
          env: z.record(z.string(), z.string()).optional(),
        })
        .passthrough(),
    )
    .optional(),
});

export type MCPConfig = z.infer<typeof MCPConfigSchema>;

export interface MCPStatus {
  readonly name: string;
  readonly configured: boolean;
  readonly canConnect: boolean;
  readonly error?: string;
}

export interface MCPHealthSummary {
  readonly results: readonly MCPStatus[];
  readonly healthy: number;
  readonly unhealthy: number;
  readonly allHealthy: boolean;
}

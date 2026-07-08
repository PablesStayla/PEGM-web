/**
 * 🛡️ Validation System Types - Staff Level
 * Interfaces compartidas para la infraestructura de auditoría y validación.
 */

export enum FindingType {
  CRITICAL = 'CRÍTICO',
  WARNING = 'ADVERTENCIA',
  GIGANTISM = 'GIGANTISMO',
  FORBIDDEN_IMPORT = 'PROHIBIDO',
}

export interface AuditFinding {
  type: FindingType;
  line: number;
  message: string;
  filePath: string;
}

export interface ValidationConfig {
  SEARCH_ROOT: string;
  EXCLUDE_DIRS: string[];
  EXCLUDE_FILES: string[];
  EXCLUDE_EXTENSIONS: string[];
  EXTENSIONS: string[];
  MAX_FILE_SIZE_BYTES?: number;
}

interface AuditResult {
  findings: AuditFinding[];
  errors: string[];
  warnings: string[];
}

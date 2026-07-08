/**
 * Providers - Ports & Adapters Infrastructure
 *
 * This module provides the \"ports\" that resources consume.
 * Each provider is an abstraction over external concerns:
 * - DataProvider: Database/ORM access
 * - AuthProvider: Authentication & session management
 * - ActionProvider: Server action client with middleware
 * - AccessControl: CASL-based authorization
 */

// Access control (CASL)
export * from './access-control';
// Action client for server actions
export * from './action-provider';
// Auth port & adapter
export * from './auth';
// Data layer port & adapter
export * from './data';

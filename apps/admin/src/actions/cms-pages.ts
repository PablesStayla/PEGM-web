/**
 * CMS Pages Actions
 *
 * This file serves as an aggregator for all CMS-related admin actions.
 * Following S+ engineering standards, the implementation logic is modularized
 * into the ./cms directory to maintain file lengths under 200 lines.
 */

export * from './cms/delete-cms-page';
export * from './cms/get-cms-pages';
export * from './cms/types';
export * from './cms/upsert-cms-page';

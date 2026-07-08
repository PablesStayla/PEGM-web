/**
 * @pranakaia/hooks — Entry point
 *
 * React hooks compartidos entre apps/web (storefront) y apps/admin.
 * Los hooks específicos de cada app viven en su propia carpeta src/hooks/.
 * Este package contiene SOLO los hooks que son genuinamente cross-app.
 */
export * from './use-cart';
export * from './use-checkout';

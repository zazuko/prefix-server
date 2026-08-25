// Ambient declarations (this file must stay a script: no imports/exports).

declare module '@cypress/snapshot' {
  /** Adds the `cy.snapshot()` command, storing snapshots in `snapshots.js`. */
  export function register (): void
}

declare namespace Cypress {
  interface Chainable {
    /** Compares the subject with the stored snapshot (or stores it on the first run). */
    snapshot (options?: { name?: string, json?: boolean }): Chainable
  }
}

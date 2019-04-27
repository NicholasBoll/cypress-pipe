/**
 * Decorate a function with meta-data to be used with `cy.pipe`. Adds
 * a display name and arguments of a function.
 * @param name The name of the function to be displayed in the Cypress
 * Command Log. The parameter is only required if the function passed
 * to `cy.pipe` is anonymous
 * @param fn Function to decorate
 * @example
 * const getProp = loggable('getProp', prop => obj => obj[prop])
 */
export function loggable<T extends Function>(name: string, fn: T): T

/**
 * Decorate a function with meta-data to be used with `cy.pipe`. Adds
 * arguments of a function.
 * @param fn Function to decorate
 * @example
 * const getProp = loggable(prop => function getProp(obj) { return obj[prop] })
 */
export function loggable<T extends Function>(fn: T): T

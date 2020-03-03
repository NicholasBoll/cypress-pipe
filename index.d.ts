/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Enables you to work with the subject yielded from the previous command.
       * Similar to `cy.then`, except the function can be re-evaluated if followed by
       * a `.should` AND returns a value synchronously (no `cy` commands inside).
       * In this instance, your function should not have any side effects and could be run
       * many times per second.
       *
       * It can start a chain or continue a chain. If starting a chain, the subject
       * will be the body elememnt
       *
       * ```ts
       * const getChildren = $el => $el.children()
       *
       * cy.get('body')
       *   .pipe(getChildren)
       *   .should('have.length', 3)
       *
       * cy.pipe(getChildren) // $el will be body
       *   .should('have.length', 3)
       * ```
       */
      pipe<S>(
        fn: (this: { [key: string]: any }, currentSubject: Subject) => Chainable<S> | Promise<S>,
        options?: Partial<Timeoutable & Loggable>,
      ): Chainable<S>
      /**
       * Enables you to work with the subject yielded from the previous command.
       * Similar to `cy.then`, except the function can be re-evaluated if followed by
       * a `.should` AND returns a value synchronously (no `cy` commands inside).
       * In this instance, your function should not have any side effects and could be run
       * many times per second.
       *
       * It can start a chain or continue a chain. If starting a chain, the subject
       * will be the body elememnt
       *
       * ```ts
       * const getChildren = $el => $el.children()
       *
       * cy.get('body')
       *   .pipe(getChildren)
       *   .should('have.length', 3)
       *
       * cy.pipe(getChildren) // $el will be body
       *   .should('have.length', 3)
       * ```
       */
      pipe<S extends object | any[] | string | number | boolean | undefined | null>(
        fn: (this: { [key: string]: any }, currentSubject: Subject) => S,
        options?: Partial<Timeoutable & Loggable>,
      ): Chainable<S>
      /**
       * Starts a chain. The subject is the jQuery-wrapped body element is given to the function.
       * Similar to `cy.then`, except the function can be re-evaluated if followed by
       * a `.should` AND returns a value synchronously (no `cy` commands inside).
       * In this instance, your function should not have any side effects and could be run
       * many times per second.
       *
       * ```ts
       * const getChildren = $el => $el.children()
       *
       * cy.pipe(getChildren)
       *   .should('have.length', 3)
       * ```
       */
      pipe<S extends object | any[] | string | number | boolean | undefined | null>(
        fn: (this: { [key: string]: any }, currentSubject: JQuery) => S,
        options?: Partial<Timeoutable & Loggable>,
      ): Chainable<S>
    }
  }
}

export { loggable } from './loggable'

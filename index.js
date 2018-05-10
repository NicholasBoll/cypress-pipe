/// <reference types="cypress" />

Cypress.Commands.add('pipe', { prevSubject: true }, (subject, fn, options = { log: true }) => {

  const now = performance.now()
  if (options.log) {
    options._log = Cypress.log({
      message: fn.name || undefined,
    })
  }

  Cypress._.defaults(options, {
    timeout: 4000
  })

  const remoteSubject = cy.getRemotejQueryInstance(subject)
  if (remoteSubject && options._log) {
    options._log.set('$el', remoteSubject)
    options._log.snapshot('before', { next: 'after' })
  }

  const getValue = () => {
    const actualSubject = remoteSubject || subject

    const value = fn(actualSubject)
    const actualValue = cy.isCy(value) ? actualSubject : value

    if (options._log) {
      options._log.set('consoleProps', () => ({
        Command: 'pipe',
        Subject: subject,
        Message: fn.name || undefined,
        Function: fn,
        Returned: actualValue,
        Duration: performance.now() - now,
      }))
    }

    return actualValue
  }

  // wrap retrying into its own
  // separate function
  const retryValue = () =>
    Cypress.Promise.try(getValue).catch(err => {
      options.error = err
      return cy.retry(retryValue, options)
    })
  const resolveValue = () =>
    Cypress.Promise.try(retryValue).then(value =>
      cy.verifyUpcomingAssertions(value, options, {
        onRetry: resolveValue,
      }),
    ).finally(() => {
      if (options._log) {
        if (remoteSubject) {
          options._log.snapshot()
        }
        options._log.end()
      }
    })
  return resolveValue()
})

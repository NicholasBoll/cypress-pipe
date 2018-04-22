/// <reference types="cypress" />

Cypress.Commands.add('pipe', { prevSubject: true }, (subject, fn, options = {}) => {

  const log = Cypress.log({
    message: fn.name || undefined,
  })
  const now = performance.now()

  const getValue = () => {
    const remoteSubject = cy.getRemotejQueryInstance(subject)

    const actualSubject = remoteSubject || subject

    const value = fn(actualSubject)
    const actualValue = cy.isCy(value) ? actualSubject : value

    log.set('consoleProps', () => ({
      Command: 'pipe',
      Subject: subject,
      Message: fn.name || undefined,
      Function: fn,
      Returned: actualValue,
      Duration: performance.now() - now,
    }))

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
    ).finally(() => { log.end() })
  return resolveValue()
})

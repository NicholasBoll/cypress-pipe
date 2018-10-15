/// <reference types="cypress" />
const isJquery = obj =>
  !!(obj && obj.jquery && Cypress._.isFunction(obj.constructor))

const getElements = $el => {
  if (!$el && !els.length) {
    return
  }

 $el = $el.toArray()

  if ($el.length === 1) {
    return $el[0]
  } else {
    return $el
  }
}

Cypress.Commands.add('pipe', { prevSubject: true }, (subject, fn, options = { log: true }) => {

  const now = performance.now()
  let isCy = false

  if (options.log) {
    options._log = Cypress.log({
      message: fn.name || undefined,
    })
  }

  Cypress._.defaults(options, {
    timeout: 4000,
  })

  const getConsoleProps = (value) => () => ({
    Command: 'pipe',
    Subject: subject,
    Message: fn.name || undefined,
    Function: fn.toString(),
    Yielded: isJquery(value) ? getElements(value) : value,
    Elements: isJquery(value) ? value.length : undefined,
    Duration: performance.now() - now,
  })

  const getValue = () => {

    const value = fn(subject)
    isCy = cy.isCy(value)
    const actualValue = isCy ? subject : value

    if (options._log) {
      if (isCy) {
        options._log.snapshot('before', { next: 'after' })
        value.then((val) => {
          options._log.snapshot()
          options._log.set('consoleProps', getConsoleProps(val))
        })
      } else {
        options._log.set('consoleProps', getConsoleProps(actualValue))
      }
    }

    return actualValue
  }

  // retryValue will automatically retry piped functions that temporarily return errors
  const retryValue = () => {
    return Cypress.Promise.try(getValue).catch(err => {
      options.error = err
      return cy.retry(retryValue, options)
    })
  }
  const resolveValue = () => {
    return Cypress.Promise.try(retryValue).then(value => {
      return cy.verifyUpcomingAssertions(value, options, {
        onRetry: resolveValue,
      })
    })
  }

  return resolveValue().then((value) => {
    if (options._log) {
      if (!isCy && isJquery(value)) {
        options._log.snapshot()
      }
      options._log.end()
    }
    return value
  })
})

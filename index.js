/// <reference types="cypress" />

const isJquery = obj =>
  !!(obj && obj.jquery && Cypress._.isFunction(obj.constructor))

const getElements = $el => {
  if (!$el && !$el.length) {
    return
  }

 $el = $el.toArray()

  if ($el.length === 1) {
    return $el[0]
  } else {
    return $el
  }
}

/**
 * Format the argument according to its type
 * @param {any} arg 
 */
function formatArg (arg) {
  switch (typeof arg) {
    case 'function':
      return arg.name || 'function'
    default:
      return JSON.stringify(arg)
  }
}

Cypress.Commands.add('pipe', { prevSubject: true }, (subject, fn, options = { }) => {

  const getEl = (value) => isJquery(value) ? value : isJquery(subject) ? subject : undefined

  const now = performance.now()
  let isCy = false
  
  Cypress._.defaults(options, {
    log: true,
    timeout: 4000,
  })

  if (options.log) {
    options._log = Cypress.log({
      message: (fn.displayName || fn.name || undefined) + (fn.__args ? `(${fn.__args.map(formatArg).join(', ')})` : ''),
      $el: getEl(subject), // start the $el with the subject
    })
  }

  const getConsoleProps = (value) => () => ({
    Command: 'pipe',
    Subject: subject,
    Function: fn.displayName || fn.name || undefined,
    Arguments: fn.__args || [],
    Contents: fn.toString(),
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
        // If a Cypress command was detected, handle snapshots here
        options._log.snapshot('before', { next: 'after' })
        value.then((val) => {
          // Set the element to the value for the second snapshot
          options._log.set({
            $el: getEl(val),
            consoleProps: getConsoleProps(val)
          })

          options._log.snapshot()
        })
      } else {
        // If Cypress is not detected, snapshot at the very end
        options._log.set({
          $el: getEl(value),
          consoleProps: getConsoleProps(value)
        })
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
      if (!isCy) {
        // For pure functions, this is the only safe place to snapshot (guaranteed only happens once)
        options._log.snapshot()
      }
      options._log.end()
    }
    return value
  })
})

# Cypress Pipe
`cy.pipe` can be used as a simpler replacement for Cypress Custom Commands - you just write functions.

`cy.pipe` works very similarly to `cy.then` except for a few key differences:
* `pipe` will try to document the function name in the Command log (only works on named functions)
* If the function passed to `pipe` resolves synchronously (doesn't contain Cypress commands) AND is followed by a `cy.should`, the function will be retried until the assertion passes or times out (most Cypress commands do this)

```ts
const obj = { foo: 'bar' }
const getFoo = s => s.foo
setTimeout(() => { obj.foo = 'baz' }, 1000)

cy.wrap(obj)
  .pipe(getFoo)
  .should('equal', 'baz')
```

The above assertion will pass after 1 second. The Cypress Command Log will look like:

```
WRAP       {foo: bar}
 - PIPE    getFoo
 - ASSERT  expected bar to equal bar
```

If the `pipe` was using a `then`, it would fail immediately and wouldn't show the `getFoo` functions anywhere in the Cypress Command Log.

This library is a proof of concept, but should be stable. The proposal can be found here: https://github.com/cypress-io/cypress/issues/1548

## Best Practices
Don't use anonymous functions and pick short and descriptive function names. The Command Log can be used as a tool for mapping the contents of a test to the screenshot/video. This is useful when finding out which step the test failed on.

```ts
// okay
cy.wrap({ foo: 'bar' })
  .pipe(s => s.foo)
  .should('equal', 'bar')

// Command Log:
// WRAP       {foo: bar}
//  -PIPE     function() {}
//  - ASSERT  expected 'bar' to equal 'bar'

// good
const getFoo = s => s.foo
cy.wrap({ foo: 'bar' })
  .pipe(getFoo)
  .should('equal', 'bar')

// Command Log:
// WRAP       {foo: bar}
//  -PIPE     getFoo
//  - ASSERT  expected 'bar' to equal 'bar'
```

## Installation
```
npm install cypress-pipe -D
```

Add the following to your `cypress/support/index` file:

```ts
import 'cypress-pipe'
```


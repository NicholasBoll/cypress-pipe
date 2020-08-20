
## 2.0.0

* feat: Add support for `cy.within`.

### BREAKING CHANGE:
Previously `cy.pipe()` without a previous chain would fall back to using the body element always. Now, if the `cy.pipe` is inside a `cy.within`, the `withinSubject` will be used instead.

Before:
```js
cy.get('.foobar').within(() => {
  cy.pipe(el => el) // el is the body element
})
```

After:
```js
cy.get('.foobar').within(() => {
  cy.pipe(el => el) // el is the element with a `foobar` class name
})
```

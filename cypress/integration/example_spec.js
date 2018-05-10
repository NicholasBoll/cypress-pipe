describe('pipe()', () => {

  context('when function resolves synchronously', () => {
    it('should allow transforming a subject', () => {
      cy.wrap({ foo: 'bar' })
        .pipe(subject => subject.foo)
        .should('equal', 'bar')
      
    })

    it('should show the name of a function in the Command Log', (done) => {
      const getFoo = subject => subject.foo
      cy.on('log:added', (attrs, log) => {
        if (log.get('name') === 'pipe') {
          cy.removeAllListeners('log:added')

          expect(log.get('message')).to.eq('getFoo')
          expect(log.get('name')).to.eq('pipe')
          expect(log.invoke('consoleProps')).to.have.property('Command', 'pipe')
          done()
        }
      })
      cy.wrap({ foo: 'bar' })
        .pipe(getFoo) // command log should show 'getFoo'
    })

    it('should allow retry of a transform that will eventually resolve', () => {
      const obj = { foo: 'bar' }
      setTimeout(() => { obj.foo = 'baz' }, 500) // make this higher if you want to see the UI during this process
      cy.wrap(obj)
        .pipe(subject => subject.foo)
        .should('equal', 'baz')
    })
  
    it('should allow a timeout', (done) => {
      const obj = { foo: 'bar' }
      setTimeout(() => { obj.foo = 'baz' }, 1000)
      cy.wrap(obj)
        .pipe(subject => subject.foo, { timeout: 50 })
        .should('equal', 'baz')
        .then(s => {
          // we should not get here
          done(new Error('Failed to fail on timeout'))
        })
      
      cy.on('fail', (err) => {
        expect(err.message).to.include('Timed out retrying')
        expect(err.message).to.include("expected 'bar' to equal 'baz'")
        done()
      })
    })
  })

  context('when function uses cy commands', () => {
    it('should allow transforming a subject using cy commands', () => {
      cy.wrap({ foo: 'bar' })
        .pipe(subject => cy.wrap(subject.foo))
        .should('equal', 'bar')
    })

    it('should show the name of a function in the Command Log', (done) => {
      const getFoo = subject => cy.wrap(subject.foo)
      cy.on('log:added', (attrs, log) => {
        if (log.get('name') === 'pipe') {
          cy.removeAllListeners('log:added')

          expect(log.get('message')).to.eq('getFoo')
          expect(log.get('name')).to.eq('pipe')
          expect(log.invoke('consoleProps')).to.have.property('Command', 'pipe')
          done()
        }
      })
      cy.wrap({ foo: 'bar' })
        .pipe(getFoo) // command log should show 'getFoo'
    })
  })
})

function loggable(arg1, arg2) {
  if (typeof arg1 === 'string') {
    arg2.displayName = arg1
    return loggableFn(arg2)
  } else if (typeof arg1 === 'function') {
    return loggableFn(arg1)
  } else {
    throw Error('First argument must be a function or string')
  }
}

function loggableFn(fn) {
  const internalFn = function(...args) {
    const value = fn(...args)
    if (typeof value === 'function') {
      value.displayName = fn.displayName || value.name
      value.__args = args
    }
    return value
  }
  internalFn.displayName = fn.displayName || fn.name

  return internalFn
}

module.exports = { loggable }

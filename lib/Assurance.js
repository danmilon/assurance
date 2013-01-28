var validators = require('./validators')
  , sanitizers = require('./sanitizers')
  , errors     = require('./errors')

/**
 * @param {Object} object     Object to validate
 * @param {Array}  onlyFields Only validate fields in this array
 * @param {Object} alias      Alias param value of errors
 *
 * @constructor
 */
function Assurance(object, onlyFields, alias) {
  if (!(this instanceof Assurance)) {
    return new Assurance(object, onlyFields, alias)
  }
  
  this.restart(object, onlyFields, alias)

  return this
}

/**
 * Restarts this instance as it would be if it was called
 * as `new Assurance(object, onlyFields, alias)`
 *
 * @param {Object} object     Object to validate
 * @param {Array}  onlyFields Only validate fields in this array
 * @param {Object} alias      Alias param value of errors
 */
Assurance.prototype.restart = function (object, onlyFields, alias) {
  this.only    = undefined
  this.alias   = undefined
  
  this.object  = object
  this._path   = []
  this.errors  = []
  this._skip   = false
  this._canPop = true

  if (typeof onlyFields === 'string') {
    onlyFields = [onlyFields]
  }
  
  if (Array.isArray(onlyFields)) {
    this.only = onlyFields
  }
  else if (typeof onlyFields === 'object') {
    alias      = onlyFields
    onlyFields = undefined
  }

  var aliasType = typeof alias
  if (aliasType !== 'undefined') {
    if (aliasType !== 'object') {
      throw new Error('alias not an object')
    }
    
    this.alias = alias
  }

  return this
}

/**
 * @return {Boolean} Whether any error has occured yet or not
 */
Assurance.prototype.hasErrors = function () {
  return this.errors.length !== 0
};

/**
 * @return {Array} Errors occured so far
 */
Assurance.prototype.end = function () {
  return this.errors
}

Assurance.prototype.errors = Assurance.prototype.end

/**
 * Throws the first error in the stack
 */
Assurance.prototype.throw = function () {
  if (this.hasErrors()) {
    throw this.errors[0]
  }
}

Assurance.prototype._pop = function () {
  if (this._canPop) {
    this._path.pop()
  }
}

/**
 * @return {Object} The top object in the path stack
 * @private
 */
Assurance.prototype._top = function () {
  if (this._path.length === 0) {
    return this.object
  }
  
  return this._path[this._path.length - 1]
}

/**
 * @return {} The value of the top object in the path stack
 * @private
 */
Assurance.prototype._val = function (set) {
  if (this._path.length === 0) {
    return this.object
  }

  var top = this._top()

  if (arguments.length !== 0) {
    if (typeof top.index === 'undefined') {
      top.object[top.key] = set
    }
    else {
      top.object[top.key][top.index] = set
    }

    return this
  }
  else {
    var val = top.object[top.key]

    if (typeof top.index !== 'undefined') {
      val = val[top.index]
    }

    return val
  }
}

/**
 * Computes a string representing the trail of the path stack
 * eg: `address.zipCode`, `sisters[1].firstName`
 *
 * @return {String} Trail of top object in path stack
 * @private
 */
Assurance.prototype._param = function () {
  var param

  for (var i = 0; i < this._path.length; i++) {
    var step = this._path[i]

    if (!param) {
      param = step.key
    }
    else {
      param += '.' + step.key
    }
    
    if (typeof step.index !== 'undefined') {
      param += '[' + step.index + ']'
    }
  }

  if (this.alias) {
    param = this.alias[param] || param
  }

  return param
}

/**
 * Enables the skip flag if the top object in the
 * path stack doesn't exist
 */
Assurance.prototype.optional = function () {
  if (!this._skip) {
    var val = this._val()

    // null is not included here because it is
    // considered an actual value
    var shouldSkip =
      (typeof val === 'undefined') ||
      (val === '')

    if (shouldSkip) {
      this._skip = true
    }
  }

  return this
}

/**
 * If the currently validated field is missing, val is assigned
 *
 * @param  {} val Value to assign
 */
Assurance.prototype.default = function (val) {
  var currVal = this._val()

  var isInvalid =
        (typeof currVal === 'undefined') ||
        (currVal === null)               ||
        (currVal === '')

  if (isInvalid) {
    this._val(val)
  }

  return this
}

/**
 * If the last value is an array, repetively calls fn
 * for each value in the array
 *
 * If it is an object, it dive's into the object, so nested
 * fields can be validated
 *
 * @param  {Function} fn Function to call
 */
Assurance.prototype.nest = function (fn) {
  if (this._skip) {
    return
  }

  var val = this._val()

  if (Array.isArray(val)) {
    var top = this._top()
    
    for (var i = 0; i < val.length; i++) {
      // set the index since it's an array
      // this will be picked up by _param() to set
      // a meaningful error parameter
      top.index = i

      // repeatidly call fn
      fn(this)

      // in case validation failed for one value,
      // we don't want to skip for the rest also.
      // So force _skip to false after every iteration
      this._skip = false
    }
  }
  else if (typeof val === 'object') {
    // since we're going to nest, we dont want the object we just pushed
    // to be popped in the next .me() call
    this._canPop = false

    var prevLength = this._path.length

    fn(this)

    // now its safe to pop
    this._canPop = true

    // if fn called .me() at least once, then there is a single
    // remaining object on the path stack that needs to be popped
    if (this._path.length !== prevLength) {
      this._pop()
    }
  }
  else {
    // force it to push an error
    this.is('object')
  }

  return this
}

/**
 * Allows for custom validation. calls fn(val, errors)
 *
 * If fn returns an error, it is added on the stack
 *
 * @param  {Function} fn Function to call
 */
Assurance.prototype.custom = function (fn) {
  if (this._skip) {
    return
  }

  var val   = this._val()
    , error = fn(val, errors)
  
  if (error) {
    // set error param and push
    error.param = this._param()
    this.errors.push(error)

    // since we failed once, skip rest validations
    this._skip = true
  }
  
  return this
}

/**
 * Validate top[key] where top is either
 *
 *   * the initial object passed to assurance
 *   * the last nested object
 *
 * If fn is passed, it instantly nests
 *
 * @param  {String}   key Key to validate
 * @param  {Function} fn  Nest and call fn
 */
Assurance.prototype.me = function (key, fn) {
  // if we check only for certain fields and this is not
  // one of them then skip all following validation
  if (this.only && this.only.indexOf(key) === -1) {
    this._skip = true
    return this
  }

  // pop the last object from the path stack, since it's
  // validations are over (now we'll validate another field)
  this._pop()

  // the next .me() calls can pop me
  this._canPop = true

  // add new object in path
  this._path.push({
    key:    key,
    object: this._val()
  })
  
  // we're starting a new set of validations
  // so unset any previously set options
  this._skip = false

  // if a function is passed, then we need to nest
  if (fn) {
    this.nest(fn)
  }

  return this
}

Assurance.prototype.check = Assurance.prototype.me

Assurance.runValidator = function (fn) {
  return function () {
    if (this._skip) {
      return this
    }

    var args = Array.prototype.slice.call(arguments)
      , val  = this._val()

    args.unshift(val)

    var err = fn.apply(null, args)
    
    if (typeof err === 'undefined') {
      return this
    }
    else {
      err.param = this._param()
      this.errors.push(err)
      this._skip = true
    }

    return this
  }
}

Assurance.runSanitizer = function (fn) {
  return function () {
    if (this._skip) {
      return this
    }

    var args = Array.prototype.slice.call(arguments)
      , top  = this._top()
      , val  = this._val()

    args.unshift(val)

    var newVal = fn.apply(null, args)

    if (typeof newVal === 'undefined') {
      return this
    }

    if (newVal instanceof Error) {
      newVal.param = this._param()
      this.errors.push(newVal)
      this._skip = true
    }
    else {
      top.object[top.key] = newVal
    }

    return this
  }
}

// install sanitizers
Object.keys(sanitizers).forEach(function (sanitizer) {
  var fn = sanitizers[sanitizer]

  Assurance.prototype[sanitizer] = Assurance.runSanitizer(fn)
})

// install validators
Object.keys(validators).forEach(function (validator) {
  var fn = validators[validator]
  
  Assurance.prototype[validator] = Assurance.runValidator(fn)
})

module.exports = Assurance


// from https://github.com/joyent/node/blob/27a91387ae79a3b7bc2b00a40a17c1b7846da55b/lib/util.js#L551
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
}

/**
 * Root of all the evil
 *
 * @param {String} message Error message
 */
function ValidationError(message) {
  if (message) {
    this.message = message
  }

  this.type = this.constructor.name
}

inherits(ValidationError, Error)
exports.ValidationError = ValidationError

function MissingParameter() {
  ValidationError.call(this)

  this.message = 'This parameter is required'
}

inherits(MissingParameter, ValidationError)
exports.MissingParameter = MissingParameter

function InvalidType(expected, is) {
  ValidationError.call(this)

  this.expected = expected
  this.is       = is
  this.message  = 'value is of type ' + is + ' but ' + expected + ' was expected'
}

inherits(InvalidType, ValidationError)
exports.InvalidType = InvalidType

function InvalidLength(min, max, is) {
  ValidationError.call(this)

  this.max = max
  this.is  = is

  if (min === max) {
    this.message = 'length must be less than ' + this.max
  }
  else {
    this.min = min
    this.message = 'length must be between ' + this.min + ' and ' + this.max
  }

  
}

inherits(InvalidLength, ValidationError)
exports.InvalidLength = InvalidLength

function InvalidEmail(val) {
  ValidationError.call(this)

  this.message = val + ' is not a valid email'
}

inherits(InvalidEmail, ValidationError)
exports.InvalidEmail = InvalidEmail

function NotAnOption(val, arr) {
  ValidationError.call(this)

  this.message  = val + ' was not expected'
  this.expected = arr
  this.is       = val
}

inherits(NotAnOption, ValidationError)
exports.NotAnOption = NotAnOption

function InvalidValue(message, is) {
  ValidationError.call(this)

  this.message = message
  this.is      = is
}

inherits(InvalidValue, ValidationError)
exports.InvalidValue = InvalidValue

function ParamNotExpected(message) {
  ValidationError.call(this)

  this.message = message
}

inherits(ParamNotExpected, ValidationError)
exports.ParamNotExpected = ParamNotExpected

var errors = require('./errors')

exports.matches = function (val, regex) {
  if (!regex.test(val)) {
    return new errors.InvalidValue('value must match ' + regex, val)
  }
}

exports.len = function (val, min, max) {
  var len = val.length

  if (arguments.length === 2) {
    max = min
    min = max
    
    if (len > max) {
      return new errors.InvalidLength(min, max, len)
    }
  }
  else {
    if ((len > max) || (len < min)) {
      return new errors.InvalidLength(min, max, len)
    }
  }
}

exports.isInt = function (val) {
  if (val % 1 !== 0) {
    return new errors.InvalidValue('value must be an integer', val)
  }
}

// see http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
var EMAIL_REGEX =
  '^(([^<>()[\\]\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@((\\[[0-9]' +
  '{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]' +
  '{2,}))$'

EMAIL_REGEX = new RegExp(EMAIL_REGEX)

exports.isEmail = function (val) {
  var type = typeof val

  if (type !== 'string') {
    return new errors.InvalidType('string', type)
  }

  if (!EMAIL_REGEX.test(val)) {
    return new errors.InvalidEmail(val)
  }
}

exports.oneOf = function (val, arr) {
  if (arr.indexOf(val) === -1) {
    return new errors.NotAnOption(val, arr)
  }
}

exports.required = function (val) {
  if ((typeof val === 'undefined') || (val === null)) {
    return new errors.MissingParameter()
  }
}

exports.is = function (val, expectedType) {
  var type = typeof val

  var expectedButNotPresent =
        (expectedType !== 'undefined') &&
        (expectedType !== null)        &&
        (type === 'undefined' || val === null)

  if (expectedButNotPresent) {
    return new errors.MissingParameter()
  }

  if (expectedType === 'array') {
    if (Array.isArray(val)) {
      return
    }
    else {
      return new errors.InvalidType(expectedType, type)
    }
  }

  if (type !== expectedType) {
    return new errors.InvalidType(expectedType, type)
  }
}

exports.gt = function (val, gtVal) {
  if (!(val > gtVal)) {
    return new errors.InvalidValue('expected a value greater than ' + gtVal, val)
  }
}

exports.lt = function (val, ltVal) {
  if (!(val < ltVal)) {
    return new errors.InvalidValue('expected a value less than ' + ltVal, val)
  }
}

exports.max = function (val, maxVal) {
  if (!(val <= maxVal)) {
    return new errors.InvalidValue('must be at most ' + maxVal, val)
  }
}

exports.min = function (val, minVal) {
  if (!(val >= minVal)) {
    return new errors.InvalidValue('must be at least ' + minVal, val)
  }
}

exports.equals = function (val, otherVal) {
  if (val !== otherVal) {
    return new errors.InvalidValue('value must equal ' + otherVal, val)
  }
}

exports.notEquals = function (val, otherVal) {
  if (val === otherVal) {
    return new errors.InvalidValue('value must not equal ' + otherVal, val)
  }
}

exports.consistsOf = function (val, index) {
  var i

  if (Array.isArray(index) || typeof index === 'string') {
    for (i = 0; i < val.length; i++) {
      if (index.indexOf(val[i]) === -1) {
        return new errors.InvalidValue('didnt expect value to contain ' + val[i], val)
      }
    }
  }
  else {
    for (i = 0; i < val.length; i++) {
      if (!index[val[i]]) {
        return new errors.InvalidValue('didnt expect value to contain ' + val[i], val)
      }
    }
  }
}

// TODO: unicode support
exports.isLowerCase = function (val) {
  if (/[A-Z]/.test(val)) {
    return new errors.InvalidValue('must contain only lower case characters', val)
  }
}

// TODO: unicode support
exports.isUpperCase = function (val) {
  if (/[a-z]/.test(val)) {
    return new errors.InvalidValue('must contain only upper case characters', val)
  }
}

exports.contains = function (val, elem) {
  if (val.indexOf(elem) === -1) {
    return new errors.InvalidValue('must contain ' + elem, val)
  }
}

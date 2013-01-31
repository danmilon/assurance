var errors = require('./errors')

var checkNaN = Number.isNaN || isNaN

exports.toInt = function (val) {
  if (typeof val === 'number') {
    return Math.floor(val)
  }

  var newVal = parseInt(val, 10)

  if (checkNaN(newVal)) {
    return new errors.InvalidType('integer', typeof val)
  }

  return newVal
}

exports.toFloat = function (val) {
  if (typeof val === 'number') {
    return
  }

  var newVal = parseFloat(val)

  if (checkNaN(newVal)) {
    return new errors.InvalidType('float', typeof val)
  }

  return newVal
}

exports.trim = function (val) {
  return val.trim()
}

exports.toUpperCase = function (val) {
  return val.toUpperCase()
}

exports.toLowerCase = function (val) {
  return val.toLowerCase()
}

var errors = require('./errors')

exports.toInt = function (val) {
  if (typeof val === 'number') {
    return Math.floor(val)
  }

  var newVal = parseInt(val, 10)

  if (Number.isNaN(newVal)) {
    return new errors.InvalidType('integer', typeof val)
  }

  return newVal
}

exports.toFloat = function (val) {
  if (typeof val === 'number') {
    return
  }

  var newVal = parseFloat(val)

  if (Number.isNaN(newVal)) {
    return new errors.InvalidType('float', typeof val)
  }

  return newVal
}

exports.trim = function (val) {
  return val.trim()
}

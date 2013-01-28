var Assurance  = require('./Assurance')
  , validators = require('./validators')
  , sanitizers = require('./sanitizers')

var assurance = new Assurance()

module.exports = function singleton(object, onlyFields, alias) {
  return assurance.restart(object, onlyFields, alias)
}

module.exports.extend = function (type, fn) {
  if (type === 'validator') {

  }
  else if (type === 'sanitizer') {

  }
  else {
    throw new Error('unknown type ' + type)
  }
}

var Assurance  = require('./Assurance')

var assurance = new Assurance()

module.exports = function singleton(object, onlyFields, alias) {
  return assurance.restart(object, onlyFields, alias)
}

module.exports.extend = function (type, name, fn) {
  if (typeof name === 'function') {
    fn = name
    name = fn.name
  }

  if (type === 'validator') {
    Assurance.prototype[name] = Assurance.runValidator(fn)
  }
  else if (type === 'sanitizer') {
    Assurance.prototype[name] = Assurance.runSanitizer(fn)
  }
  else {
    throw new Error('unknown type ' + type)
  }
}

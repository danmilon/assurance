// just for the browser
require('./shims')

var Assurance      = require('./Assurance')
  , errors         = require('./errors')
  , AssuranceGroup = require('./AssuranceGroup')
  , singleton      = require('./singleton')
  , validators     = require('./validators')
  , sanitizers     = require('./sanitizers')


module.exports = singleton

module.exports.validators = validators
module.exports.sanitizers = sanitizers
module.exports.errors     = errors
module.exports.Assurance  = Assurance

module.exports.single = function (object, key, alias) {
  var assure = new Assurance(object, alias)

  return assure.me(key)
}

module.exports.group = function () {
  return new AssuranceGroup()
}

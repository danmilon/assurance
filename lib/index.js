var Assurance      = require('./Assurance')
  , errors         = require('./errors')
  , AssuranceGroup = require('./AssuranceGroup')

module.exports = Assurance

module.exports.single = function (object, key, alias) {
  var assure = new Assurance(object, alias)

  return assure.me(key)
}

module.exports.group = function () {
  return new AssuranceGroup()
}

module.exports.errors     = errors
module.exports.Assurance  = Assurance

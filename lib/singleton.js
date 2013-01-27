var Assurance = require('./Assurance')


var assurance = new Assurance()

module.exports = function singleton(object, onlyFields, alias) {
  return assurance.restart(object, onlyFields, alias)
}

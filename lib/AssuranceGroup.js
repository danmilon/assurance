
// CRAPNESS. SHOULD BE DEPRECATED

var Assurance = require('./Assurance')

function AssuranceGroup() {
  this.assurances = []
}

AssuranceGroup.prototype.me = function (object, key) {
  var assure = new Assurance(object)
  this.assurances.push(assure)

  return assure.me(key)
}

AssuranceGroup.prototype.end = function () {
  var totalErrors = []
  for (var i = 0; i < this.assurances.length; i++) {
    var errors = this.assurances[i].end()

    for (var j = 0; j < errors.length; j++) {
      totalErrors.push(errors[j])
    }
  }

  return totalErrors
}

AssuranceGroup.prototype.hasErrors = function () {
  for (var i = 0; i < this.assurances.length; i++) {
    if (this.assurances[i].hasErrors()) {
      return true
    }
  }

  return false
}

module.exports = AssuranceGroup

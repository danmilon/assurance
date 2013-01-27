var assurance = require('assurance')

var o = {
  integer: 'not an integer',
  string:  1337
}

var assure = assurance(o, ['string'])

assure.me('integer').is('number').isInt()
assure.me('string').is('string')

console.log(assure.end())
// [ { type: 'InvalidType',
//     expected: 'string',
//     is: 'number',
//     message: 'value is of type number but string was expected',
//     param: 'string' } ]

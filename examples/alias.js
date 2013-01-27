var assurance = require('assurance')

var o = {
  kittenParam: 'meew'
}

var assure = assurance(o, { kittenParam: 'kitten' })

assure.me('kittenParam').is('number')

console.log(assure.end())
// [ { type: 'InvalidType',
//     expected: 'number',
//     is: 'string',
//     message: 'value is of type string but number was expected',
//     param: 'kitten' } ]

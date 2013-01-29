var assurance = require('assurance')

var malicious = {
  name:     'Eve',
  hobbies:  ['WHERE', 1, '=', 1],
  integer:  3.14,
  positive: -666
}

var assure = assurance(malicious)

assure.me('name').is('string')

assure.me('hobbies', function (hobby) {
  hobby.is('string')
})

assure.me('integer').is('number').isInt()
assure.me('positive').is('number').isInt().gt(0)

console.log(assure.end())
// [ { type: 'InvalidType',
//     expected: 'string',
//     is: 'number',
//     message: 'value is of type number but string was expected',
//     param: 'hobbies[1]' },
//   { type: 'InvalidType',
//     expected: 'string',
//     is: 'number',
//     message: 'value is of type number but string was expected',
//     param: 'hobbies[3]' },
//   { type: 'InvalidValue',
//     message: 'value must be an integer',
//     is: 3.14,
//     param: 'integer' },
//   { type: 'InvalidValue',
//     message: 'expected a value greater than 0',
//     is: -666,
//     param: 'positive' } ]


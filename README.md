## Assurance - We've got you covered!


_Assurance_ is a validation library, which:

  * Provides a **clean** & **easy** API
  * Returns meaningful error **objects**, not error messages
  * **Accumulates** errors, doesn't bail straight away
  * Loves nested objects
  * Is general purpose - ish
  * Doesn't use schemas
  * Doesn't throw

## Examples

When things go right.

```javascript
var assurance = require('assurance')

var o = {
  name:  'john',
  age:   16,
  adult: false,
  likes: ['sports', 'music', 'coding'],
  schedule: {
    monday:  ['school'],
    tuesday: ['sleep'],
    wednesday: {
      start: '10:30',
      end:   '11:15'
    }
  }
}

var assure = assurance(o)

assure.me('name').is('string').len(100)
assure.me('age').isNumber().isInt().isPositive()
assure.me('adult').is('boolean')

// can nest in arrays
assure.me('likes', function (hobby) {
  // I'm passed each single element
  hobby.is('string')
})

// can do validations and then ntest
assure.me('schedule').is('object').nest(function () {
  // now i'm validating john's schedule
  assure.me('monday').is('array')
  assure.me('tuesday').is('array')

  // nest in objects too
  assure.me('wednesday', function () {
    // now we're validating internal fields
    assure.me('start').is('string').matches(/\d\d:\d\d/)
  })
})

console.log(assure.end())
// []

```


or things go wrong
```javascript
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
assure.me('positive').is('number').isInt().isPositive()

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
//     message: 'expected a positive number',
//     is: -666,
//     param: 'positive' } ]
```

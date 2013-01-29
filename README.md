## Assurance - We've got you covered!
[![build status](https://secure.travis-ci.org/danmilon/assurance.png)](http://travis-ci.org/danmilon/assurance)


_Assurance_ is a validation library, which:

  * Provides a **clean** & **pretty** API
  * Returns meaningful error **objects**, not error messages
  * **Accumulates** errors, doesn't bail straight away
  * Loves nested objects
  * Is general purpose - ish
  * Is resource conservative
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
assure.me('age').is('number').isInt().isPositive()
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

or wrong

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

## How to invoke

    var assure = assurance(object, onlyFields, alias)

* `object`: The object to validate
* `onlyFields`: Optional array of strings. Only fields in this array will validated (top-level only)
* `alias`: Optional object mapping object fields to other names, in case a field has errors (top-level only)

Remember that internally, a [single assurance instance][] is used. Whenever you
call `.assurance(...)`, the internal instance is merely brought to a state as it
would be if it was a new object. Due to the single-threaded execution of node,
and the fact that most times you want to validate only one object at a time, by
following this approach, we don't have to create a new [Assurance object][]
every time we need to perform validations and then throw it away through garbage
collection.

### onlyFields example

```javascript
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
```

### alias example

```javascript
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
```

## me(field, [fn]), #check(field, [fn])

Declares that the following validation calls are about `field`. `.check` is an alias, because `.me` as a name does not make sense when it is not `assure.me()`. if `fn` is passed, it instantly calls `.nest(fn)`.

## hasErrors()

Returns a boolean indicating whether there are any validation errors yet.

```javascript
assurance({ age: 5 }).check('age').is('number').hasErrors()
// false
```

## end() / errors()

Returns the errors accumulated so far.
`.errors()` is an alias.

```javascript
assurance({ age: 'a' }).check('age').is('number').end()
// [ { type: 'InvalidType' ... } ]

assurance({ age: 5 }).check('age').is('number').end()
// []
```

## throw()

Throws the first error caught.

```javascript
assurance({ age: 'a' }).check('age').is('number').throw()
// Error: value is of type string but number was expected
```

## optional()

Indicates that the current field being validated is optional

```javascript
assurance({}).check('age').optional().is('number').end()
// []
```

## default(val)

If the currently validated field is missing, a default value is assigned

```javascript
var o = {}
assurance(o).check('age').default(18).is('number').min(18).end()
// []
console.log(o)
// { age: 18 }
```

## nest(fn)

Nests inside an object or array, to validate their inner elements.

```javascript
assurance({ bands: ['cranberries', 'the doors', 666] }).check('bands').nest(function (band) {
  band.is('string')
}).end()
// [ { type: 'InvalidType',
//     expected: 'string',
//     is: 'number',
//     message: 'value is of type number but string was expected',
//     param: 'bands[2]' } ]
```

## custom(fn)

Allows fn to perform custom checks on the current value being validated.
For convention, except the value, fn is passed the built-in errors which
you can use and return. But this is not a restriction, fn can return any
object which captures the error in whatever way you want.

```javascript
assurance({ name: 'dan' }).check('name').is('string').custom(function (name, errors) {
  if (name[0] === name[0].toLowerCase()) {
    return new errors.InvalidValue('expected name to be titled (ie George)', name)
  }
}).end()
// [ { type: 'InvalidValue',
//     message: 'expected name to be titled (ie George)',
//     is: 'dan',
//     param: 'name' } ]
```

## extend(type, [name], fn)

Adds a new validator or sanitizer.

* `type`: `validator` or `sanitizer`
* `name`: name of the new method (ie `assure.me('field')._name_(...)`)
* `fn`:   validator or sanitizer function

If `name` is omitted, then the name of the function will be used.

`fn` is first passed the value of the field currently being validated, and then
the rest of the arguments passed when the method was invoked.

* If `fn` is a validator, in case of error, it must return an object.
* If `fn` is a sanitizer, should return the new value, if needed.

```javascript
assurance.extend('sanitizer', function toUpperCase(val) {
  return val.toUpperCase()
})
```

## Validators

    .is(type)            typeof val === type (extra type 'array')
    .gt(number)          val > number
    .lt(number)          val < number
    .max(number)         val <= number
    .min(number)         val >= number
    .equals(other)       val === other
    .notEquals(other)    val !== other
    .required()          val !== undefined && val !== null
    .oneOf(array)        val exists in array
    .isEmail()           val has an email format
    .isInt()             val is an integral number
    .matches(regex)      val matches regex
    .len(min, max)       val.length between min and max
    .len(max)            val.length at most max
    .consistsOf(index)   val contains only stuff found in index

## Sanitizers

    .toInt()    number & string to integers
    .toFloar()  string to float
    .trim()     trims whitespace from left & right

## Tests

    npm test
    make test

[single assurance instance]: https://github.com/danmilon/assurance/tree/master/lib/singleton.js
[Assurance object]: https://github.com/danmilon/assurance/blob/master/lib/Assurance.js

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

var validators = require('../').validators
  , should     = require('should')


describe('assurance validators', function () {
  describe('is', function () {
    it('should work for numbers', function () {
      should.not.exist(validators.is(5, 'number'))
    })

    it('should throw elseways', function () {
      var err = validators.is('ff', 'number')

      err.type.should.equal('InvalidType')
      err.expected.should.equal('number')
      err.is.should.be.a('string')
    })
  })

  describe('matches', function () {
    it('should work if it matches', function () {
      should.not.exist(validators.matches('hello mister', /mister/))
    })

    it('should throw for non-matching strings', function () {
      var err = validators.matches('mew kitten', /mister/)

      err.type.should.equal('InvalidValue')
      err.is.should.equal('mew kitten')
      err.message.should.equal('value must match /mister/')
    })
  })

  describe('len', function () {
    it('should work if the length is correct', function () {
      should.not.exist(validators.len(new Array(5), 4, 6))
    })

    it('should optinally have only max', function () {
      should.not.exist(validators.len(new Array(5), 10))
      should.exist(validators.len(new Array(5), 2))
    })

    it('should throw for invalid lengths', function () {
      var err = validators.len(new Array(10), 1, 3)

      err.type.should.equal('InvalidLength')
      err.is.should.equal(10)
      err.min.should.equal(1)
      err.max.should.equal(3)
      err.message.should.equal('length must be between 1 and 3')
    })
  })

  describe('isInt', function () {
    it('should work for integers', function () {
      should.not.exist(validators.isInt(5))
    })

    it('should throw for non-integers', function () {
      should.exist(validators.isInt('string'))
      
      var err = validators.isInt(5.5)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(5.5)
      err.message.should.equal('value must be an integer')
    })
  })

  describe('isEmail', function () {
    it('should work for emails', function () {
      should.not.exist(validators.isEmail('danmilon@gmail.com'))
      should.not.exist(validators.isEmail('δανμιλον@gmail.com'))
    })
  })

  describe('gt', function () {
    it('should accept numbers greater than param', function () {
      should.not.exist(validators.gt(5, 0))
    })

    it('should not be inclusive', function () {
      should.exist(validators.gt(5, 5))
    })

    it('should not accept numbers less than param', function () {
      var err = validators.gt(0, 5)

      should.exist(err)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(0)
      err.message.should.equal('expected a value greater than 5')
    })
  })

  describe('lt', function () {
    it('should accept numbers less than param', function () {
      should.not.exist(validators.lt(0, 5))
    })

    it('should not be inclusive', function () {
      should.exist(validators.lt(5, 5))
    })

    it('should not accept numbers greater than param', function () {
      var err = validators.lt(5, 0)

      should.exist(err)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(5)
      err.message.should.equal('expected a value less than 0')
    })
  })

  describe('max', function () {
    it('should accept numbers less than param', function () {
      should.not.exist(validators.max(5, 10))
    })

    it('should be inclusive', function () {
      should.not.exist(validators.max(5, 5))
    })

    it('should not accept numbers greater than param', function () {
      var err = validators.max(5, 0)

      should.exist(err)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(5)
      err.message.should.equal('must be at most 0')
    })
  })

  describe('min', function () {
    it('should accept numbers greater than param', function () {
      should.not.exist(validators.min(5, 0))
    })

    it('should be inclusive', function () {
      should.not.exist(validators.min(5, 5))
    })

    it('should not accept numbers less than param', function () {
      var err = validators.min(0, 5)

      should.exist(err)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(0)
      err.message.should.equal('must be at least 5')
    })
  })

  describe('consistsOf', function () {
    it('should work with an array as index', function () {
      should.not.exist(validators.consistsOf('ac', 'abc'))
      should.not.exist(validators.consistsOf('ac', ['a', 'b', 'c']))
      should.exist(validators.consistsOf('a@c', 'abc'))
    })

    it('should work with an object as index', function () {
      var index = { a: 1, b: 1, c: 1 }

      should.not.exist(validators.consistsOf('abc', index))
      should.exist(validators.consistsOf('a@c', index))
    })

    it('should have proper errors', function () {
      var err = validators.consistsOf('a@c', 'abc')

      should.exist(err)
      err.type.should.equal('InvalidValue')
      err.is.should.equal('a@c')
    })
  })

  describe('oneOf', function () {
    it('should accept a value included in the array', function () {
      should.not.exist(validators.oneOf('a', ['a', 'b', 'c']))
    })

    it('should accept an index(object) instead of an array', function () {
      var index = { a: 1, c: 1 }

      should.not.exist(validators.oneOf('a', index))

      var err = validators.oneOf('b', index)

      should.exist(err)
      should.deepEqual(err.expected, ['a', 'c'])
    })

    it('should not accept a value not included in the array', function () {
      var expected = ['a', 'b', 'c']
        , err      = validators.oneOf('d', expected)

      should.exist(err)
      err.type.should.equal('NotAnOption')
      err.is.should.equal('d')
      should.deepEqual(err.expected, expected)
    })
  })
  
  describe('required', function () {
    it('should accept non-undefined, non-null values', function () {
      var values = ['string', {}, 5, []]

      values.forEach(function (value) {
        should.not.exist(validators.required(value))
      })
    })

    it('should not accept undefined or null values', function () {
      var values = [undefined, null]

      values.forEach(function (value) {
        var err = validators.required(value)

        should.exist(err)
        err.type.should.equal('MissingParameter')
      })
    })
  })

  describe('equals', function () {
    it('should accept a value equal to param', function () {
      should.not.exist(validators.equals(5, 5))
    })

    it('should not accept a value unequal to param', function () {
      var err = validators.equals(5, 10)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(5)
      err.message.should.equal('value must equal 10')
    })
  })

  describe('notEquals', function () {
    it('should accept a value unequal to param', function () {
      should.not.exist(validators.notEquals(5, 10))
    })

    it('should not accept a value equal to param', function () {
      var err = validators.notEquals(5, 5)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(5)
      err.message.should.equal('value must not equal 5')
    })
  })

  describe('isUpperCase', function () {
    it('should accept all-uppercase strings', function () {
      should.not.exist(validators.isUpperCase('AB CD'))
    })

    it('should not accept strings with lowercase characters', function () {
      var err = validators.isUpperCase('AB cd')

      should.exist(err)
      err.type.should.equal('InvalidValue')
      err.is.should.equal('AB cd')
      err.message.should.equal('must contain only upper case characters')
    })
  })

  describe('isLowerCase', function () {
    it('should accept all-lowercase strings', function () {
      should.not.exist(validators.isLowerCase('ab cd'))
    })

    it('should not accept strings with uppercase characters', function () {
      var err = validators.isLowerCase('AB cd')

      should.exist(err)
      err.type.should.equal('InvalidValue')
      err.is.should.equal('AB cd')
      err.message.should.equal('must contain only lower case characters')
    })
  })

  describe('contains', function () {
    it('should accept arrays which contain elem', function () {
      should.not.exist(validators.contains(['a', 'b', 'c'], 'b'))
    })

    it('should not accept arrays which dont contain elem', function () {
      var err = validators.contains(['a', 'b', 'c'], 'd')

      should.exist(err)
      err.type.should.equal('InvalidValue')
      should.deepEqual(err.is, ['a', 'b', 'c'])
      err.message.should.equal('must contain d')
    })
  })
})

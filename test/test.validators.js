var validators = require('../').validators
  , should     = require('should')


describe('assurance validators', function () {
  describe('isNumber', function () {
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

  describe('isPositive', function () {
    it('should work for positive numbers', function () {
      should.not.exist(validators.isPositive(10))
      should.not.exist(validators.isPositive(0))
    })

    it('should optionally throw for zero', function () {
      should.exist(validators.isPositive(0, false))
    })

    it('should throw elseways', function () {
      var err = validators.isPositive(-5)

      err.type.should.equal('InvalidValue')
      err.is.should.equal(-5)
      err.message.should.equal('expected a positive number')
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
})

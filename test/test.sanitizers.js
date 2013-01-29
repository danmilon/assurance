var sanitizers = require('../').sanitizers

describe('Assurance sanitizers', function () {
  describe('toInt', function () {
    it('should convert a valid string to an integer', function () {
      sanitizers.toInt('55').should.equal(55)
    })

    it('should not accept invalid values', function () {
      var err = sanitizers.toInt('arbitrary')

      err.type.should.equal('InvalidType')
      err.expected.should.equal('integer')
      err.is.should.equal('string')
    })
  })

  describe('toFloat', function () {
    it('should convert a valid string to a float', function () {
      sanitizers.toFloat('55.15').should.equal(55.15)
      sanitizers.toFloat('55').should.equal(55)
    })

    it('should not accept invalid values', function () {
      var err = sanitizers.toFloat('arbitrary')

      err.type.should.equal('InvalidType')
      err.expected.should.equal('float')
      err.is.should.equal('string')
    })
  })
})

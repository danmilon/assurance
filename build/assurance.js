;(function(){


/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("assurance/lib/index.js", function(exports, require, module){
var Assurance      = require('./Assurance')
  , errors         = require('./errors')
  , AssuranceGroup = require('./AssuranceGroup')
  , singleton      = require('./singleton')
  , validators     = require('./validators')
  , sanitizers     = require('./sanitizers')


module.exports = singleton

module.exports.validators = validators
module.exports.sanitizers = sanitizers
module.exports.errors     = errors
module.exports.Assurance  = Assurance

module.exports.single = function (object, key, alias) {
  var assure = new Assurance(object, alias)

  return assure.me(key)
}

module.exports.group = function () {
  return new AssuranceGroup()
}


});
require.register("assurance/lib/Assurance.js", function(exports, require, module){
var validators = require('./validators')
  , sanitizers = require('./sanitizers')
  , errors     = require('./errors')

/**
 * @param {Object} object     Object to validate
 * @param {Array}  onlyFields Only validate fields in this array
 * @param {Object} alias      Alias param value of errors
 *
 * @constructor
 */
function Assurance(object, onlyFields, alias) {
  if (!(this instanceof Assurance)) {
    return new Assurance(object, onlyFields, alias)
  }
  
  this.restart(object, onlyFields, alias)

  return this
}

/**
 * Restarts this instance as it would be if it was called
 * as `new Assurance(object, onlyFields, alias)`
 *
 * @param {Object} object     Object to validate
 * @param {Array}  onlyFields Only validate fields in this array
 * @param {Object} alias      Alias param value of errors
 */
Assurance.prototype.restart = function (object, onlyFields, alias) {
  this.only    = undefined
  this.alias   = undefined
  
  this.object  = object
  this._path   = []
  this.errors  = []
  this._skip   = false
  this._canPop = true

  if (typeof onlyFields === 'string') {
    onlyFields = [onlyFields]
  }
  
  if (Array.isArray(onlyFields)) {
    this.only = onlyFields
  }
  else if (typeof onlyFields === 'object') {
    alias      = onlyFields
    onlyFields = undefined
  }

  var aliasType = typeof alias
  if (aliasType !== 'undefined') {
    if (aliasType !== 'object') {
      throw new Error('alias not an object')
    }
    
    this.alias = alias
  }

  return this
}

/**
 * @return {Boolean} Whether any error has occured yet or not
 */
Assurance.prototype.hasErrors = function () {
  return this.errors.length !== 0
};

/**
 * @return {Array} Errors occured so far
 */
Assurance.prototype.end = function () {
  return this.errors
}

Assurance.prototype.errors = Assurance.prototype.end

/**
 * Throws the first error in the stack
 */
Assurance.prototype.throw = function () {
  if (this.hasErrors()) {
    throw this.errors[0]
  }
}

Assurance.prototype._pop = function () {
  if (this._canPop) {
    this._path.pop()
  }
}

/**
 * @return {Object} The top object in the path stack
 * @private
 */
Assurance.prototype._top = function () {
  if (this._path.length === 0) {
    return this.object
  }
  
  return this._path[this._path.length - 1]
}

/**
 * @return {} The value of the top object in the path stack
 * @private
 */
Assurance.prototype._val = function (set) {
  if (this._path.length === 0) {
    return this.object
  }

  var top = this._top()

  if (arguments.length !== 0) {
    if (typeof top.index === 'undefined') {
      top.object[top.key] = set
    }
    else {
      top.object[top.key][top.index] = set
    }

    return this
  }
  else {
    var val = top.object[top.key]

    if (typeof top.index !== 'undefined') {
      val = val[top.index]
    }

    return val
  }
}

/**
 * Computes a string representing the trail of the path stack
 * eg: `address.zipCode`, `sisters[1].firstName`
 *
 * @return {String} Trail of top object in path stack
 * @private
 */
Assurance.prototype._param = function () {
  var param

  for (var i = 0; i < this._path.length; i++) {
    var step = this._path[i]

    if (!param) {
      param = step.key
    }
    else {
      param += '.' + step.key
    }
    
    if (typeof step.index !== 'undefined') {
      param += '[' + step.index + ']'
    }
  }

  if (this.alias) {
    param = this.alias[param] || param
  }

  return param
}

/**
 * Enables the skip flag if the top object in the
 * path stack doesn't exist
 */
Assurance.prototype.optional = function () {
  if (!this._skip) {
    var val = this._val()

    // null is not included here because it is
    // considered an actual value
    var shouldSkip =
      (typeof val === 'undefined') ||
      (val === '')

    if (shouldSkip) {
      this._skip = true
    }
  }

  return this
}

/**
 * If the currently validated field is missing, val is assigned
 *
 * @param  {} val Value to assign
 */
Assurance.prototype.default = function (val) {
  var currVal = this._val()

  var isInvalid =
        (typeof currVal === 'undefined') ||
        (currVal === null)               ||
        (currVal === '')

  if (isInvalid) {
    this._val(val)
  }

  return this
}

/**
 * If the last value is an array, repetively calls fn
 * for each value in the array
 *
 * If it is an object, it dive's into the object, so nested
 * fields can be validated
 *
 * @param  {Function} fn Function to call
 */
Assurance.prototype.nest = function (fn) {
  if (this._skip) {
    return
  }

  var val = this._val()

  if (Array.isArray(val)) {
    var top = this._top()
    
    for (var i = 0; i < val.length; i++) {
      // set the index since it's an array
      // this will be picked up by _param() to set
      // a meaningful error parameter
      top.index = i

      // repeatidly call fn
      fn(this)

      // in case validation failed for one value,
      // we don't want to skip for the rest also.
      // So force _skip to false after every iteration
      this._skip = false
    }
  }
  else if (typeof val === 'object') {
    // since we're going to nest, we dont want the object we just pushed
    // to be popped in the next .me() call
    this._canPop = false

    var prevLength = this._path.length

    fn(this)

    // now its safe to pop
    this._canPop = true

    // if fn called .me() at least once, then there is a single
    // remaining object on the path stack that needs to be popped
    if (this._path.length !== prevLength) {
      this._pop()
    }
  }
  else {
    // force it to push an error
    this.is('object')
  }

  return this
}

/**
 * Allows for custom validation. calls fn(val, errors)
 *
 * If fn returns an error, it is added on the stack
 *
 * @param  {Function} fn Function to call
 */
Assurance.prototype.custom = function (fn) {
  if (this._skip) {
    return
  }

  var val   = this._val()
    , error = fn(val, errors)
  
  if (error) {
    // set error param and push
    error.param = this._param()
    this.errors.push(error)

    // since we failed once, skip rest validations
    this._skip = true
  }
  
  return this
}

/**
 * Validate top[key] where top is either
 *
 *   * the initial object passed to assurance
 *   * the last nested object
 *
 * If fn is passed, it instantly nests
 *
 * @param  {String}   key Key to validate
 * @param  {Function} fn  Nest and call fn
 */
Assurance.prototype.me = function (key, fn) {
  // if we check only for certain fields and this is not
  // one of them then skip all following validation
  if (this.only && this.only.indexOf(key) === -1) {
    this._skip = true
    return this
  }

  // pop the last object from the path stack, since it's
  // validations are over (now we'll validate another field)
  this._pop()

  // the next .me() calls can pop me
  this._canPop = true

  // add new object in path
  this._path.push({
    key:    key,
    object: this._val()
  })
  
  // we're starting a new set of validations
  // so unset any previously set options
  this._skip = false

  // if a function is passed, then we need to nest
  if (fn) {
    this.nest(fn)
  }

  return this
}

Assurance.prototype.check = Assurance.prototype.me

Assurance.runValidator = function (fn) {
  return function () {
    if (this._skip) {
      return this
    }

    var args = Array.prototype.slice.call(arguments)
      , val  = this._val()

    args.unshift(val)

    var err = fn.apply(null, args)
    
    if (typeof err === 'undefined') {
      return this
    }
    else {
      err.param = this._param()
      this.errors.push(err)
      this._skip = true
    }

    return this
  }
}

Assurance.runSanitizer = function (fn) {
  return function () {
    if (this._skip) {
      return this
    }

    var args = Array.prototype.slice.call(arguments)
      , top  = this._top()
      , val  = this._val()

    args.unshift(val)

    var newVal = fn.apply(null, args)

    if (typeof newVal === 'undefined') {
      return this
    }

    if (newVal instanceof Error) {
      newVal.param = this._param()
      this.errors.push(newVal)
      this._skip = true
    }
    else {
      top.object[top.key] = newVal
    }

    return this
  }
}

// install sanitizers
Object.keys(sanitizers).forEach(function (sanitizer) {
  var fn = sanitizers[sanitizer]

  Assurance.prototype[sanitizer] = Assurance.runSanitizer(fn)
})

// install validators
Object.keys(validators).forEach(function (validator) {
  var fn = validators[validator]
  
  Assurance.prototype[validator] = Assurance.runValidator(fn)
})

module.exports = Assurance

});
require.register("assurance/lib/AssuranceGroup.js", function(exports, require, module){

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

});
require.register("assurance/lib/errors.js", function(exports, require, module){

// from https://github.com/joyent/node/blob/27a91387ae79a3b7bc2b00a40a17c1b7846da55b/lib/util.js#L551
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
}

/**
 * Root of all the evil
 *
 * @param {String} message Error message
 */
function ValidationError(message) {
  if (message) {
    this.message = message
  }

  this.type = this.constructor.name
}

inherits(ValidationError, Error)
exports.ValidationError = ValidationError

function MissingParameter() {
  ValidationError.call(this)

  this.message = 'This parameter is required'
}

inherits(MissingParameter, ValidationError)
exports.MissingParameter = MissingParameter

function InvalidType(expected, is) {
  ValidationError.call(this)

  this.expected = expected
  this.is       = is
  this.message  = 'value is of type ' + is + ' but ' + expected + ' was expected'
}

inherits(InvalidType, ValidationError)
exports.InvalidType = InvalidType

function InvalidLength(min, max, is) {
  ValidationError.call(this)

  this.max = max
  this.is  = is

  if (min === max) {
    this.message = 'length must be less than ' + this.max
  }
  else {
    this.min = min
    this.message = 'length must be between ' + this.min + ' and ' + this.max
  }

  
}

inherits(InvalidLength, ValidationError)
exports.InvalidLength = InvalidLength

function InvalidEmail(val) {
  ValidationError.call(this)

  this.message = val + ' is not a valid email'
}

inherits(InvalidEmail, ValidationError)
exports.InvalidEmail = InvalidEmail

function NotAnOption(val, arr) {
  ValidationError.call(this)

  this.message  = val + ' was not expected'
  this.expected = arr
  this.is       = val
}

inherits(NotAnOption, ValidationError)
exports.NotAnOption = NotAnOption

function InvalidValue(message, is) {
  ValidationError.call(this)

  this.message = message
  this.is      = is
}

inherits(InvalidValue, ValidationError)
exports.InvalidValue = InvalidValue

function ParamNotExpected(message) {
  ValidationError.call(this)

  this.message = message
}

inherits(ParamNotExpected, ValidationError)
exports.ParamNotExpected = ParamNotExpected

});
require.register("assurance/lib/sanitizers.js", function(exports, require, module){
var errors = require('./errors')

var checkNaN = Number.isNaN || isNaN

exports.toInt = function (val) {
  if (typeof val === 'number') {
    return Math.floor(val)
  }

  var newVal = parseInt(val, 10)

  if (checkNaN(newVal)) {
    return new errors.InvalidType('integer', typeof val)
  }

  return newVal
}

exports.toFloat = function (val) {
  if (typeof val === 'number') {
    return
  }

  var newVal = parseFloat(val)

  if (checkNaN(newVal)) {
    return new errors.InvalidType('float', typeof val)
  }

  return newVal
}

exports.trim = function (val) {
  return val.trim()
}

exports.toUpperCase = function (val) {
  return val.toUpperCase()
}

exports.toLowerCase = function (val) {
  return val.toLowerCase()
}

});
require.register("assurance/lib/singleton.js", function(exports, require, module){
var Assurance  = require('./Assurance')

var assurance = new Assurance()

module.exports = function singleton(object, onlyFields, alias) {
  return assurance.restart(object, onlyFields, alias)
}

module.exports.extend = function (type, name, fn) {
  if (typeof name === 'function') {
    fn = name
    name = fn.name
  }

  if (type === 'validator') {
    Assurance.prototype[name] = Assurance.runValidator(fn)
  }
  else if (type === 'sanitizer') {
    Assurance.prototype[name] = Assurance.runSanitizer(fn)
  }
  else {
    throw new Error('unknown type ' + type)
  }
}

});
require.register("assurance/lib/validators.js", function(exports, require, module){
var errors = require('./errors')

exports.matches = function (val, regex) {
  if (!regex.test(val)) {
    return new errors.InvalidValue('value must match ' + regex, val)
  }
}

exports.len = function (val, min, max) {
  var len = val.length

  if (arguments.length === 2) {
    max = min
    min = max
    
    if (len > max) {
      return new errors.InvalidLength(min, max, len)
    }
  }
  else {
    if ((len > max) || (len < min)) {
      return new errors.InvalidLength(min, max, len)
    }
  }
}

exports.isInt = function (val) {
  if (val % 1 !== 0) {
    return new errors.InvalidValue('value must be an integer', val)
  }
}

// see http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
var EMAIL_REGEX =
  '^(([^<>()[\\]\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@((\\[[0-9]' +
  '{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]' +
  '{2,}))$'

EMAIL_REGEX = new RegExp(EMAIL_REGEX)

exports.isEmail = function (val) {
  var type = typeof val

  if (type !== 'string') {
    return new errors.InvalidType('string', type)
  }

  if (!EMAIL_REGEX.test(val)) {
    return new errors.InvalidEmail(val)
  }
}

exports.oneOf = function (val, arr) {
  if (arr.indexOf(val) === -1) {
    return new errors.NotAnOption(val, arr)
  }
}

exports.required = function (val) {
  if ((typeof val === 'undefined') || (val === null)) {
    return new errors.MissingParameter()
  }
}

exports.is = function (val, expectedType) {
  var type = typeof val

  var expectedButNotPresent =
        (expectedType !== 'undefined') &&
        (expectedType !== null)        &&
        (type === 'undefined' || val === null)

  if (expectedButNotPresent) {
    return new errors.MissingParameter()
  }

  if (expectedType === 'array') {
    if (Array.isArray(val)) {
      return
    }
    else {
      return new errors.InvalidType(expectedType, type)
    }
  }

  if (type !== expectedType) {
    return new errors.InvalidType(expectedType, type)
  }
}

exports.gt = function (val, gtVal) {
  if (!(val > gtVal)) {
    return new errors.InvalidValue('expected a value greater than ' + gtVal, val)
  }
}

exports.lt = function (val, ltVal) {
  if (!(val < ltVal)) {
    return new errors.InvalidValue('expected a value less than ' + ltVal, val)
  }
}

exports.max = function (val, maxVal) {
  if (!(val <= maxVal)) {
    return new errors.InvalidValue('must be at most ' + maxVal, val)
  }
}

exports.min = function (val, minVal) {
  if (!(val >= minVal)) {
    return new errors.InvalidValue('must be at least ' + minVal, val)
  }
}

exports.equals = function (val, otherVal) {
  if (val !== otherVal) {
    return new errors.InvalidValue('value must equal ' + otherVal, val)
  }
}

exports.notEquals = function (val, otherVal) {
  if (val === otherVal) {
    return new errors.InvalidValue('value must not equal ' + otherVal, val)
  }
}

exports.consistsOf = function (val, index) {
  var i

  if (Array.isArray(index) || typeof index === 'string') {
    for (i = 0; i < val.length; i++) {
      if (index.indexOf(val[i]) === -1) {
        return new errors.InvalidValue('didnt expect value to contain ' + val[i], val)
      }
    }
  }
  else {
    for (i = 0; i < val.length; i++) {
      if (!index[val[i]]) {
        return new errors.InvalidValue('didnt expect value to contain ' + val[i], val)
      }
    }
  }
}

// TODO: unicode support
exports.isLowerCase = function (val) {
  if (/[A-Z]/.test(val)) {
    return new errors.InvalidValue('must contain only lower case characters', val)
  }
}

// TODO: unicode support
exports.isUpperCase = function (val) {
  if (/[a-z]/.test(val)) {
    return new errors.InvalidValue('must contain only upper case characters', val)
  }
}

exports.contains = function (val, elem) {
  if (val.indexOf(elem) === -1) {
    return new errors.InvalidValue('must contain ' + elem, val)
  }
}

});
require.alias("assurance/lib/index.js", "assurance/index.js");

if (typeof exports == "object") {
  module.exports = require("assurance");
} else if (typeof define == "function" && define.amd) {
  define(require("assurance"));
} else {
  window["assurance"] = require("assurance");
}})();
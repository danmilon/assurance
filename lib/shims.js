// if we run in the browser, load some shims
// if not, supress the error and move on
try {
  require('object.keys-shim')
} catch (ex) {
  
}


MOCHA_FLAGS  ?= -R spec
MOCHA        ?= ./node_modules/.bin/mocha
TESTS        ?= $$(find test -name *.test.js)

BROWSERBUILD ?= ./node_modules/.bin/browserbuild
UGLIFYJS     ?= ./node_modules/.bin/uglifyjs

test:
	$(MOCHA) -r should $(MOCHA_FLAGS) $(TESTS)

build:
	$(BROWSERBUILD)   \
	  -m lib/index.js \
	  -g assurance    \
	  -b lib/         \
	  $$(find lib -name '*.js') > build/assurance.js

	$(UGLIFYJS) build/assurance.js > build/assurance.min.js

.PHONY: test build test2

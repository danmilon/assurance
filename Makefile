
MOCHA_FLAGS  ?= -R spec
MOCHA        ?= ./node_modules/.bin/mocha
TESTS        ?= $$(find test -name *.test.js)

COMPONENT ?= ./node_modules/.bin/component
UGLIFYJS  ?= ./node_modules/.bin/uglifyjs

test:
	$(MOCHA) -r should $(MOCHA_FLAGS) $(TESTS)

build:
	$(COMPONENT) build --standalone assurance --name assurance
	$(UGLIFYJS) build/assurance.js > build/assurance.min.js

.PHONY: test build

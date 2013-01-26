
MOCHA_FLAGS ?= -R spec
MOCHA       ?= ./node_modules/.bin/mocha
TESTS       ?= $$(find test -name *.test.js)

test:
	$(MOCHA) -r should $(MOCHA_FLAGS) $(TESTS)

.PHONY: test

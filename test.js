var chai = require('chai'),
		should = chai.should(),
		nativity = require('./index.js');

describe('toInstance', function() {

	it('should return an object with "this" forwarded to the first argument', function() {
		var o = { a: 1 };
		var get = function(host) { return host.a; };
		var getInstanced = nativity.toInstance(get, 0);
		getInstanced.call(o).should.equal(1);
	});

	it('should use a default thisIndex of 0', function() {
		var o = { a: 1 };
		var get = function(host) { return host.a; };
		var getInstanced = nativity.toInstance(get);
		getInstanced.call(o).should.equal(1);
	});

	it('should pass other arguments as normal', function() {
		var o = { a: 'a' };
		var get = function(host, one, two) { return host.a + one + two; };
		var getInstanced = nativity.toInstance(get, 0);
		getInstanced.call(o, 'b', 'c').should.equal('abc');
	});

	it('should forward "this" into any argument position', function() {
		var o = { a: 'a' };
		var get = function(one, host, two) { return host.a + one + two; };
		var getInstanced = nativity.toInstance(get, 1);
		getInstanced.call(o, 'b', 'c').should.equal('abc');

		var get2 = function(one, two, host) { return host.a + one + two; };
		var getInstanced2 = nativity.toInstance(get2, 2);
		getInstanced2.call(o, 'b', 'c').should.equal('abc');
	});

	it('should call the original function with the context of the instanced function', function() {
		var o = { a: 'a' };
		var get = function() { return this.a; };
		var getInstanced = nativity.toInstance(get);
		getInstanced.call(o).should.equal('a');
	});

});


describe('installOne', function() {

  it('should assign a given function to the destination object with the given key', function() {
		var dest = { a: 1 };
		var get = function() { return this.a; };

		nativity.installOne(dest, get, 'get');

		dest.should.have.property('a', 1);
		dest.should.have.property('get');
		dest.get().should.equal(1);
  });

	it('should not forward "this" if thisIndex === null', function() {
		var dest = { a: 1 };
		var identity = function(x) { return x; };

		nativity.installOne(dest, identity, 'identity', { thisIndex: null });

		dest.should.have.property('a', 1);
		dest.should.have.property('identity');
		dest.identity(10).should.equal(10);
	});

  it('should override properties with the same name on the destination object if the safe option is set to false', function() {
		var dest = { a: 1 };
		nativity.installOne(dest, 10, 'a', { safe: false });
		dest.should.have.property('a', 10);
  });

  it('should return an object with a "overwritten" property indicating the number of properties overwritten', function() {
		var dest = { a: 1 };
		var installation = nativity.installOne(dest, 10, 'a', { safe: false });
		should.exist(installation);
		installation.should.have.property('overwritten', 1);
  });

  it('should return an object with an uninstall method', function() {
		var dest = { a: 1 };

		var installation = nativity.installOne(dest, 10, 'a', { safe: false });

		should.exist(installation);
		installation.should.have.property('uninstall');
		installation.uninstall();
		dest.should.have.property('a', 1);
  });

});


describe('install', function() {

  it('should install all properties from the src object to the dest object', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20, get: function() { return this.a; } };

		nativity.install(dest, src);

		dest.should.have.property('a', 1);
		dest.should.have.property('b', 20);

		dest.should.have.property('get');
		dest.get().should.equal(1);
  });


  it('should install specific properties if a property list is given', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20, get: function() { return this.a; } };

		nativity.install(dest, src, ['b']);

		dest.should.have.property('a', 1);
		dest.should.have.property('b', 20);
		dest.should.not.have.property('get');
  });


	it('should accept a key-value pair in place of a property name which will map the key to the source object and the value to the destination object', function() {
		var dest = {};
		var src = { numberOne: function() { return 1; } };

		nativity.install(dest, src, [{ numberOne: 'one' }]);

		dest.should.not.have.property('numberOne');
		dest.should.have.property('one');
		dest.one().should.equal(1);
	});

  it('should support optional props even if an options object is supplied', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20 };

		nativity.install(dest, src, { safe: false });

		dest.should.have.property('a', 10);
		dest.should.have.property('b', 20);
  });

  it('should return an object with a "overwritten" property indicating the number of properties overwritten', function() {
		var dest = { a: 1, b: 2 };
		var src = { a: 10, b: 20, c: 30 };

		var installation = nativity.install(dest, src, { safe: false });
		should.exist(installation);
		installation.should.have.property('overwritten', 2);
  });

  it('should return an object with an uninstall method', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20 };

		var installation = nativity.install(dest, src, { safe: false });

		should.exist(installation);
		installation.should.have.property('uninstall');
		installation.uninstall();
		dest.should.have.property('a', 1);
		dest.should.not.have.property('b');
  });

});

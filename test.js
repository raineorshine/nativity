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


describe('install', function() {

  it('should install a given function to the destination object', function() {
		var dest = { a: 1 };
		var get = function() { return this.a; };

		nativity.install(dest, get);

		dest.should.have.property('a', 1);
		dest.should.have.property('get');
		dest.get().should.equal(1);
  });

  it('should install an array of functions to the destination object', function() {
		var dest = { a: 1 };
		var get1 = function() { return this.a; };
		var get2 = function() { return this.a * 2; };

		nativity.install(dest, [get1, get2]);

		dest.should.have.property('a', 1);
		dest.should.have.property('get1');
		dest.should.have.property('get2');
		dest.get1().should.equal(1);
		dest.get2().should.equal(2);
  });

  it('should install all properties from the src object to the dest object', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20, get: function() { return this.a; } };

		nativity.install(dest, src);

		dest.should.have.property('a', 1);
		dest.should.have.property('b', 20);

		dest.should.have.property('get');
		dest.get().should.equal(1);
  });


  it('should override properties with the same name on the destination object if the safe option is set to false', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20 };

		nativity.install(dest, src, null, { safe: false });

		dest.should.have.property('a', 10);
  });


  it('should install specific properties if a property list is given', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20, get: function() { return this.a; } };

		nativity.install(dest, src, ['b']);

		dest.should.have.property('a', 1);
		dest.should.have.property('b', 20);
		dest.should.not.have.property('get');
  });


  it('should forward "this" as the first argument to the installed method', function() {
		var lib = {
			pluck: function(arr, prop) {
			  return arr.map(function(item) {
			    return item[prop];
			  });
			}
		};
		nativity.install(Array.prototype, lib);

		people = [
			{ name: 'Theodore' },
			{ name: 'Margaret' },
			{ name: 'Ida' }
		];
		people.should.have.property('pluck')
		people.pluck('name').should.deep.equal(['Theodore', 'Margaret', 'Ida']);
  });


	it('should be able to forward "this" to any argument position', function() {
	  throw new Error('Test Not Implemented');
	});


	it('should not forward "this" if thisIndex === null', function() {
	  throw new Error('Test Not Implemented');
	});

	it('should accept a key-value pair in place of a property name which will map the key to the source object and the value to the destination object', function() {
		var dest = {};
		var src = { numberOne: function() { return 1; } };

		nativity.install(dest, src, [{ numberOne: 'one' }]);

		dest.should.not.have.property('numberOne');
		dest.should.have.property('one');
		dest.one().should.equal(1);
	});

});
